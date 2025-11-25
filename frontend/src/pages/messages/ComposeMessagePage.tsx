/**
 * ComposeMessagePage Component
 *
 * Allows members to compose and send messages to other members
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send, Search, X } from 'lucide-react';
import { useSendMessage } from '../../hooks/useMessages';
import { useMemberSearch, useMemberProfile } from '../../hooks/useMembers';
import { useDebounce } from '../../hooks/useDebounce';
import { SidebarLayout } from '../../components/layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Label } from '../../components/ui/label';
import { MemberPublic } from '../../services/endpoints/memberService';

export function ComposeMessagePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-fill recipient if provided in URL
  const prefilledRecipientId = searchParams.get('to');
  const prefilledSubject = searchParams.get('subject') || '';

  // Form state
  const [recipientId, setRecipientId] = useState<string>(prefilledRecipientId || '');
  const [selectedRecipient, setSelectedRecipient] = useState<MemberPublic | null>(null);
  const [subject, setSubject] = useState(prefilledSubject);
  const [body, setBody] = useState('');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);

  // Search recipients
  const debouncedSearch = useDebounce(recipientSearch, 300);
  const { results: searchResults, loading: searchLoading } = useMemberSearch({
    query: debouncedSearch,
    limit: 10,
  });

  // Fetch prefilled recipient details
  const { member: prefilledMember } = useMemberProfile({
    memberId: prefilledRecipientId || '',
    autoFetch: !!prefilledRecipientId,
  });

  // Set prefilled recipient when loaded
  useEffect(() => {
    if (prefilledMember) {
      setSelectedRecipient(prefilledMember);
      setRecipientId(prefilledMember.id);
    }
  }, [prefilledMember]);

  // Send message hook
  const { sendMessage, loading: sending, error } = useSendMessage();

  const handleSelectRecipient = (member: MemberPublic) => {
    setSelectedRecipient(member);
    setRecipientId(member.id);
    setRecipientSearch('');
    setShowRecipientDropdown(false);
  };

  const handleClearRecipient = () => {
    setSelectedRecipient(null);
    setRecipientId('');
    setRecipientSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientId || !subject.trim() || !body.trim()) {
      return;
    }

    try {
      await sendMessage({
        recipientId,
        subject: subject.trim(),
        body: body.trim(),
      });
      navigate('/messages?folder=sent');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const content = (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/messages')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Messages
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>New Message</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient */}
            <div className="space-y-2">
              <Label htmlFor="recipient">To</Label>

              {selectedRecipient ? (
                <div className="flex items-center gap-2 rounded-md border p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {getInitials(selectedRecipient.firstName, selectedRecipient.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 font-medium">
                    {selectedRecipient.firstName} {selectedRecipient.lastName}
                  </span>
                  <Button type="button" variant="ghost" size="sm" onClick={handleClearRecipient}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="recipient"
                    placeholder="Search for a member..."
                    value={recipientSearch}
                    onChange={(e) => {
                      setRecipientSearch(e.target.value);
                      setShowRecipientDropdown(true);
                    }}
                    onFocus={() => setShowRecipientDropdown(true)}
                    className="pl-10"
                  />

                  {/* Search Results Dropdown */}
                  {showRecipientDropdown && recipientSearch.length >= 2 && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-md border bg-background shadow-lg">
                      {searchLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Searching...
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto">
                          {searchResults.map((member) => (
                            <button
                              key={member.id}
                              type="button"
                              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted"
                              onClick={() => handleSelectRecipient(member)}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {getInitials(member.firstName, member.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {member.firstName} {member.lastName}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No members found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                minLength={3}
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Type your message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={8}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/messages')}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sending || !recipientId || !subject.trim() || !body.trim()}
              >
                {sending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  return <SidebarLayout>{content}</SidebarLayout>;
}
