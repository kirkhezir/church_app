/**
 * English Tutorial Ministry Enrollment Form
 *
 * Public enrollment form for the English Tutorial Ministry.
 * Fields: Name, Nickname, Gender, Age, Birthdate, and optional Phone/Email.
 */
import { useState, FormEvent, ChangeEvent } from 'react';
import { isAxiosError } from 'axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/i18n';
import { englishTutorialService } from '@/services/endpoints/englishTutorialService';

interface EnrollmentFormData {
  name: string;
  nickname: string;
  gender: 'MALE' | 'FEMALE' | '';
  age: string;
  birthDate: string;
  phone: string;
  email: string;
}

interface ValidationErrors {
  name?: string;
  nickname?: string;
  gender?: string;
  age?: string;
  birthDate?: string;
  email?: string;
}

const initialFormData: EnrollmentFormData = {
  name: '',
  nickname: '',
  gender: '',
  age: '',
  birthDate: '',
  phone: '',
  email: '',
};

export function EnglishTutorialEnrollmentForm() {
  const { language } = useI18n();
  const isThai = language === 'th';

  const [formData, setFormData] = useState<EnrollmentFormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = isThai ? 'กรุณากรอกชื่อ' : 'Name is required';
    }
    if (!formData.nickname.trim()) {
      newErrors.nickname = isThai ? 'กรุณากรอกชื่อเล่น' : 'Nickname is required';
    }
    if (!formData.gender) {
      newErrors.gender = isThai ? 'กรุณาเลือกเพศ' : 'Gender is required';
    }

    const age = Number(formData.age);
    if (!formData.age || !Number.isInteger(age) || age < 1 || age > 120) {
      newErrors.age = isThai
        ? 'อายุต้องเป็นตัวเลข 1-120 ปี'
        : 'Age must be a number between 1 and 120';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = isThai ? 'กรุณาเลือกวันเกิด' : 'Birthdate is required';
    } else if (new Date(formData.birthDate).getTime() > Date.now()) {
      newErrors.birthDate = isThai
        ? 'วันเกิดต้องไม่เป็นวันในอนาคต'
        : 'Birthdate cannot be in the future';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = isThai ? 'รูปแบบอีเมลไม่ถูกต้อง' : 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value as 'MALE' | 'FEMALE' }));
    if (errors.gender) {
      setErrors((prev) => ({ ...prev, gender: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitStatus('idle');
    setSubmitMessage('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await englishTutorialService.enroll({
        name: formData.name.trim(),
        nickname: formData.nickname.trim(),
        gender: formData.gender as 'MALE' | 'FEMALE',
        age: Number(formData.age),
        birthDate: formData.birthDate,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
      });

      setSubmitStatus('success');
      setSubmitMessage(
        isThai
          ? 'ขอบคุณสำหรับการลงทะเบียน! เราจะติดต่อกลับเร็วๆ นี้'
          : 'Thank you for enrolling! We will contact you soon.'
      );
      setFormData(initialFormData);
    } catch (error) {
      const serverMessage =
        isAxiosError(error) && typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : isAxiosError(error) && Array.isArray(error.response?.data?.message)
            ? error.response.data.message.join(', ')
            : undefined;

      setSubmitStatus('error');
      setSubmitMessage(
        serverMessage ||
          (isThai
            ? 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
            : 'Something went wrong. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="et-name">{isThai ? 'ชื่อ' : 'Name'}</Label>
          <Input
            id="et-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'et-name-error' : undefined}
            className="mt-1"
          />
          {errors.name && (
            <p id="et-name-error" className="mt-1 text-sm text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="et-nickname">{isThai ? 'ชื่อเล่น' : 'Nickname'}</Label>
          <Input
            id="et-nickname"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            aria-invalid={!!errors.nickname}
            aria-describedby={errors.nickname ? 'et-nickname-error' : undefined}
            className="mt-1"
          />
          {errors.nickname && (
            <p id="et-nickname-error" className="mt-1 text-sm text-red-600">
              {errors.nickname}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="et-gender">{isThai ? 'เพศ' : 'Gender'}</Label>
          <Select value={formData.gender} onValueChange={handleGenderChange}>
            <SelectTrigger id="et-gender" className="mt-1" aria-invalid={!!errors.gender}>
              <SelectValue placeholder={isThai ? 'เลือกเพศ' : 'Select gender'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">{isThai ? 'ชาย' : 'Male'}</SelectItem>
              <SelectItem value="FEMALE">{isThai ? 'หญิง' : 'Female'}</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
        </div>

        <div>
          <Label htmlFor="et-age">{isThai ? 'อายุ' : 'Age'}</Label>
          <Input
            id="et-age"
            name="age"
            type="number"
            min={1}
            max={120}
            value={formData.age}
            onChange={handleChange}
            aria-invalid={!!errors.age}
            aria-describedby={errors.age ? 'et-age-error' : undefined}
            className="mt-1"
          />
          {errors.age && (
            <p id="et-age-error" className="mt-1 text-sm text-red-600">
              {errors.age}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="et-birthdate">{isThai ? 'วันเกิด' : 'Birthdate'}</Label>
          <Input
            id="et-birthdate"
            name="birthDate"
            type="date"
            max={new Date().toISOString().split('T')[0]}
            value={formData.birthDate}
            onChange={handleChange}
            aria-invalid={!!errors.birthDate}
            aria-describedby={errors.birthDate ? 'et-birthdate-error' : undefined}
            className="mt-1"
          />
          {errors.birthDate && (
            <p id="et-birthdate-error" className="mt-1 text-sm text-red-600">
              {errors.birthDate}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="et-phone">
            {isThai ? 'เบอร์โทรศัพท์ (ไม่บังคับ)' : 'Phone (optional)'}
          </Label>
          <Input
            id="et-phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1"
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="et-email">{isThai ? 'อีเมล (ไม่บังคับ)' : 'Email (optional)'}</Label>
          <Input
            id="et-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'et-email-error' : undefined}
            className="mt-1"
          />
          {errors.email && (
            <p id="et-email-error" className="mt-1 text-sm text-red-600">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      {submitStatus === 'success' && (
        <p className="rounded-md bg-green-50 p-3 text-sm text-green-700" role="status">
          {submitMessage}
        </p>
      )}
      {submitStatus === 'error' && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {submitMessage}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting
          ? isThai
            ? 'กำลังส่ง...'
            : 'Submitting...'
          : isThai
            ? 'ลงทะเบียน'
            : 'Enroll Now'}
      </Button>
    </form>
  );
}
