/**
 * Admin Create Member Page
 *
 * Form to create new member accounts:
 * - Email, name, role fields
 * - Optional phone and address
 * - Sends invitation email
 * - Displays temporary password
 *
 * T310-T311: Create admin create member page
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { adminService, CreateMemberResponse } from '../../services/endpoints/adminService';

export default function AdminCreateMemberPage() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'MEMBER' as 'MEMBER' | 'STAFF' | 'ADMIN',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<CreateMemberResponse | null>(null);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminService.createMember({
        ...formData,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
      });
      setSuccess(response);
    } catch (err: any) {
      setError(err.message || 'Failed to create member');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mb-4 text-5xl text-green-600">✓</div>
            <CardTitle className="text-2xl">Member Created Successfully</CardTitle>
            <CardDescription>An invitation email has been sent to {success.email}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gray-100 p-4">
              <h3 className="mb-2 font-medium">Member Details</h3>
              <p>
                <strong>Name:</strong> {success.firstName} {success.lastName}
              </p>
              <p>
                <strong>Email:</strong> {success.email}
              </p>
              <p>
                <strong>Role:</strong> {success.role}
              </p>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Temporary Password:</strong>
                <code className="ml-2 rounded bg-gray-200 px-2 py-1">
                  {success.temporaryPassword}
                </code>
                <p className="mt-2 text-sm">
                  This password has been included in the invitation email. The member should change
                  it after their first login.
                </p>
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(null);
                setFormData({
                  email: '',
                  firstName: '',
                  lastName: '',
                  role: 'MEMBER',
                  phone: '',
                  address: '',
                });
              }}
              className="flex-1"
            >
              Add Another
            </Button>
            <Link to="/admin/members" className="flex-1">
              <Button className="w-full">View All Members</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Member</CardTitle>
          <CardDescription>
            Add a new member to the church directory. An invitation email will be sent.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name *</label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name *</label>
                <Input name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role *</label>
              <Select
                value={formData.role}
                onValueChange={(value: 'MEMBER' | 'STAFF' | 'ADMIN') =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone (optional)</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+66..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Address (optional)</label>
              <Input name="address" value={formData.address} onChange={handleChange} />
            </div>
          </CardContent>

          <CardFooter className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/members')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Member'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
