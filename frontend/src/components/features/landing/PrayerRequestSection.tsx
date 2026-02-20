/**
 * Prayer Request Section Component
 *
 * Allows visitors to submit prayer requests
 * Option for private or shared with prayer team
 *
 * UI/UX Best Practices:
 * - Comforting, supportive tone
 * - Simple form with minimal fields
 * - Clear privacy options
 * - Accessible
 */

import { useState } from 'react';
import { Heart, Send, Shield, CheckCircle2, Loader2, Users, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';

// Form data type
interface PrayerRequestFormData {
  name: string;
  email: string;
  request: string;
  isPrivate: boolean;
  wantFollowUp: boolean;
}

export function PrayerRequestSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PrayerRequestFormData>({
    name: '',
    email: '',
    request: '',
    isPrivate: false,
    wantFollowUp: false,
  });
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof PrayerRequestFormData, string>>
  >({});

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof PrayerRequestFormData, string>> = {};

    if (!formData.name || formData.name.trim().length < 1) {
      errors.name = 'Please enter your name';
    }

    if (!formData.request || formData.request.trim().length < 10) {
      errors.request = 'Please share a bit more about your prayer request (at least 10 characters)';
    }

    if (formData.wantFollowUp && (!formData.email || !formData.email.includes('@'))) {
      errors.email = 'Email is required for follow-up';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof PrayerRequestFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
      const response = await fetch(`${apiUrl}/contact/prayer-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit prayer request');
      }

      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        request: '',
        isPrivate: false,
        wantFollowUp: false,
      });

      // Reset success state after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      console.error('Prayer request submission error:', err);
      setError('Unable to submit your prayer request. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="prayer-request"
      className="bg-gradient-to-b from-rose-50 to-white py-16 sm:py-24"
      aria-labelledby="prayer-heading"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-rose-100 p-3">
            <Heart className="h-8 w-8 text-rose-600" />
          </div>
          <h2
            id="prayer-heading"
            className="mb-4 text-balance text-3xl font-bold text-foreground sm:text-4xl"
          >
            Share Your Prayer Request
          </h2>
          <p className="text-lg text-muted-foreground">
            &ldquo;Cast all your anxiety on Him because He cares for you.&rdquo;{' '}
            <span className="text-muted-foreground">— 1 Peter 5:7</span>
          </p>
          <p className="mt-4 text-muted-foreground">
            Our prayer team is here to support you. Every request is treated with care and
            confidentiality.
          </p>
        </div>

        {/* Prayer Request Form */}
        <Card className="mx-auto max-w-2xl shadow-lg">
          <CardHeader className="border-b bg-muted">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              We Pray for Every Request
            </CardTitle>
            <CardDescription>
              Your request will be prayed over by our dedicated prayer team
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {isSubmitted ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  Thank You for Sharing
                </h3>
                <p className="text-muted-foreground">
                  Your prayer request has been received. Our prayer team will be lifting you up in
                  prayer.
                </p>
                {formData.wantFollowUp && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    We&apos;ll follow up with you at the email provided.
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="prayer-name">Your Name</Label>
                  <input
                    id="prayer-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="How should we address you?"
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {formErrors.name && <p className="text-sm text-rose-600">{formErrors.name}</p>}
                </div>

                {/* Email Field - Optional unless follow-up wanted */}
                <div className="space-y-2">
                  <Label htmlFor="prayer-email">
                    Email Address{' '}
                    <span className="text-muted-foreground">
                      {formData.wantFollowUp ? '(required)' : '(optional)'}
                    </span>
                  </Label>
                  <input
                    id="prayer-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {formErrors.email && <p className="text-sm text-rose-600">{formErrors.email}</p>}
                </div>

                {/* Prayer Request Field */}
                <div className="space-y-2">
                  <Label htmlFor="prayer-request">Your Prayer Request</Label>
                  <textarea
                    id="prayer-request"
                    value={formData.request}
                    onChange={(e) => handleInputChange('request', e.target.value)}
                    placeholder="Share what's on your heart..."
                    rows={5}
                    className="w-full resize-none rounded-lg border border-border px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {formErrors.request && (
                    <p className="text-sm text-rose-600">{formErrors.request}</p>
                  )}
                </div>

                {/* Privacy Options */}
                <div className="space-y-3 rounded-lg bg-muted p-4">
                  <div className="flex items-start gap-3">
                    <input
                      id="is-private"
                      type="checkbox"
                      checked={formData.isPrivate}
                      onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="is-private" className="flex cursor-pointer items-start gap-2">
                      <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <div>
                        <span className="font-medium text-foreground/80">Keep Private</span>
                        <p className="text-sm text-muted-foreground">
                          Only the pastoral team will see this request
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      id="want-follow-up"
                      type="checkbox"
                      checked={formData.wantFollowUp}
                      onChange={(e) => handleInputChange('wantFollowUp', e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="want-follow-up"
                      className="flex cursor-pointer items-start gap-2"
                    >
                      <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <div>
                        <span className="font-medium text-foreground/80">Request Follow-up</span>
                        <p className="text-sm text-muted-foreground">
                          Someone from our team will reach out to you
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Privacy Indicator */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>
                    {formData.isPrivate
                      ? 'This request will only be seen by pastoral staff'
                      : 'This request will be shared with our prayer team'}
                  </span>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gap-2 bg-rose-600 hover:bg-rose-700"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Submit Prayer Request
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  By submitting, you agree that your request may be shared with our prayer team
                  (unless marked private).
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default PrayerRequestSection;
