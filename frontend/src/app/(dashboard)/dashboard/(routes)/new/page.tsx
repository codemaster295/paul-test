'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { publicationsAPI, handleApiError } from '@/lib/api';
import { CreatePublicationData } from '@/types/publication';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AxiosError } from 'axios';
import { ErrorResponse } from '@/types/error';

export default function NewPublicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePublicationData>({
    title: '',
    content: '',
    status: 'draft',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await publicationsAPI.createPublication(formData);
      toast.success('Publication created successfully');
      router.push('/dashboard');
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Create Publication</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter title"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Content
            </label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter content"
              required
              rows={10}
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2">
              Status
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as 'draft' | 'published' | 'archived' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <Link href="/dashboard">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Publication
          </Button>
        </div>
      </form>
    </div>
  );
}