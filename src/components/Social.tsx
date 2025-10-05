import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle, Gift, UserPlus, Crown, Shield, User } from "lucide-react";
import { useFriends } from "@/hooks/useFriends";
import { useGuilds } from "@/hooks/useGuilds";
import { useChat } from "@/hooks/useChat";

interface SocialProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | undefined;
  username: string | undefined;
}

export const Social = ({ isOpen, onClose, userId, username }: SocialProps) => {
  const [friendUsername, setFriendUsername] = useState('');
  const [guildName, setGuildName] = useState('');
  const [guildDescription, setGuildDescription] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [activeTab, setActiveTab] = useState('friends');

  const { friends, pendingRequests, sendFriendRequest, acceptFriendRequest, removeFriend } = useFriends(userId);
  const { guilds, myGuild, guildMembers, createGuild, joinGuild, leaveGuild } = useGuilds(userId);
  const { messages: globalMessages, sendMessage: sendGlobalMessage } = useChat(userId, 'global');
  const { messages: guildMessages, sendMessage: sendGuildMessage } = useChat(userId, 'guild', myGuild?.id);

  const handleSendFriendRequest = () => {
    if (friendUsername.trim()) {
      sendFriendRequest(friendUsername.trim());
      setFriendUsername('');
    }
  };

  const handleCreateGuild = () => {
    if (guildName.trim()) {
      createGuild(guildName.trim(), guildDescription.trim());
      setGuildName('');
      setGuildDescription('');
    }
  };

  const handleSendMessage = (type: 'global' | 'guild') => {
    if (chatMessage.trim() && username) {
      if (type === 'global') {
        sendGlobalMessage(chatMessage, username);
      } else {
        sendGuildMessage(chatMessage, username);
      }
      setChatMessage('');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'officer': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            Social Hub
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="guilds">Guilds</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="gifts">Gifts</TabsTrigger>
          </TabsList>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter username..."
                value={friendUsername}
                onChange={(e) => setFriendUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendFriendRequest()}
              />
              <Button onClick={handleSendFriendRequest}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Friend
              </Button>
            </div>

            {pendingRequests.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Pending Requests</h3>
                <ScrollArea className="h-32">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-2 border rounded mb-2">
                      <span>{request.friend_username}</span>
                      <Button size="sm" onClick={() => acceptFriendRequest(request.id)}>
                        Accept
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-semibold">Friends ({friends.length})</h3>
              <ScrollArea className="h-64">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-2 border rounded mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{friend.friend_username}</span>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => removeFriend(friend.id)}>
                      Remove
                    </Button>
                  </div>
                ))}
                {friends.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No friends yet</p>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Guilds Tab */}
          <TabsContent value="guilds" className="space-y-4">
            {myGuild ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-primary/5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold">{myGuild.name}</h3>
                    <Badge>Level {myGuild.level}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{myGuild.description}</p>
                  <div className="flex gap-4 text-sm">
                    <span>Members: {myGuild.total_members}/{myGuild.max_members}</span>
                    <span>Damage: {myGuild.total_damage.toLocaleString()}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={leaveGuild} className="mt-2">
                    Leave Guild
                  </Button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Members</h4>
                  <ScrollArea className="h-48">
                    {guildMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 border rounded mb-2">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(member.role)}
                          <span>{member.username}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {member.contribution_damage.toLocaleString()} dmg
                        </span>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Guild name..."
                    value={guildName}
                    onChange={(e) => setGuildName(e.target.value)}
                  />
                  <Input
                    placeholder="Description..."
                    value={guildDescription}
                    onChange={(e) => setGuildDescription(e.target.value)}
                  />
                  <Button onClick={handleCreateGuild} className="w-full">
                    Create Guild
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Available Guilds</h3>
                  <ScrollArea className="h-64">
                    {guilds.map((guild) => (
                      <div key={guild.id} className="p-3 border rounded mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold">{guild.name}</h4>
                          <Badge>Lvl {guild.level}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{guild.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">{guild.total_members}/{guild.max_members} members</span>
                          <Button size="sm" onClick={() => joinGuild(guild.id)}>
                            Join
                          </Button>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            <Tabs defaultValue="global">
              <TabsList className="w-full">
                <TabsTrigger value="global" className="flex-1">Global</TabsTrigger>
                {myGuild && <TabsTrigger value="guild" className="flex-1">Guild</TabsTrigger>}
              </TabsList>

              <TabsContent value="global" className="space-y-2">
                <ScrollArea className="h-64 p-2 border rounded">
                  {globalMessages.map((msg) => (
                    <div key={msg.id} className="mb-2 p-2 rounded bg-muted/50">
                      <span className="font-semibold text-sm">{msg.sender_username}: </span>
                      <span className="text-sm">{msg.message}</span>
                    </div>
                  ))}
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage('global')}
                  />
                  <Button onClick={() => handleSendMessage('global')}>
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>

              {myGuild && (
                <TabsContent value="guild" className="space-y-2">
                  <ScrollArea className="h-64 p-2 border rounded">
                    {guildMessages.map((msg) => (
                      <div key={msg.id} className="mb-2 p-2 rounded bg-muted/50">
                        <span className="font-semibold text-sm">{msg.sender_username}: </span>
                        <span className="text-sm">{msg.message}</span>
                      </div>
                    ))}
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage('guild')}
                    />
                    <Button onClick={() => handleSendMessage('guild')}>
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </TabsContent>

          {/* Gifts Tab */}
          <TabsContent value="gifts" className="space-y-4">
            <div className="text-center py-8">
              <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Gift system coming soon!</p>
              <p className="text-sm text-muted-foreground">Send items and currency to your friends</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
