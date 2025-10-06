'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { publicationsAPI } from '@/lib/api';
import { Publication, PublicationStatus } from '@/types/publication';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ChevronDown, MoreHorizontal, Plus, Trash, Undo } from 'lucide-react';

export default function DashboardPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PublicationStatus | 'all'>('all');
  const router = useRouter();

  const loadPublications = async () => {
    try {
      setLoading(true);
      const response = await publicationsAPI.getPublications(
        currentPage, 
        10, 
        statusFilter === 'all' ? undefined : statusFilter
      );
      setPublications(response.publications);
      setTotalPages(response.pagination.pages);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load publications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublications();
  }, [currentPage, statusFilter]);

  const handleStatusChange = async (id: number, status: PublicationStatus) => {
    try {
      await publicationsAPI.updatePublication(id, { status });
      toast.success('Status updated successfully');
      loadPublications();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await publicationsAPI.deletePublication(id);
      toast.success('Publication deleted successfully', {
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              await publicationsAPI.restorePublication(id);
              toast.success('Publication restored successfully');
              loadPublications();
            } catch (error: any) {
              toast.error(
                error.response?.data?.error || 'Failed to restore publication'
              );
            }
          },
        },
      });
      loadPublications();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete publication');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} publication${selectedIds.length > 1 ? 's' : ''}?`
    );

    if (!confirmDelete) return;

    try {
      await publicationsAPI.bulkDeletePublications(selectedIds);
      toast.success(`${selectedIds.length} publications deleted successfully`, {
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              // Restore each publication in sequence
              for (const id of selectedIds) {
                await publicationsAPI.restorePublication(id);
              }
              toast.success('Publications restored successfully');
              loadPublications();
            } catch (error: any) {
              toast.error(
                error.response?.data?.error || 'Failed to restore publications'
              );
            }
          },
        },
      });
      setSelectedIds([]);
      loadPublications();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete publications');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600 bg-green-100';
      case 'draft':
        return 'text-yellow-600 bg-yellow-100';
      case 'archived':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Publications</h1>
          {selectedIds.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleBulkDelete}
              className="flex items-center gap-2"
            >
              <Trash className="h-4 w-4" />
              Delete Selected ({selectedIds.length})
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as PublicationStatus | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Publications</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => router.push('/dashboard/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Publication
          </Button>
        </div>
      </div>

      {publications.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">
            {statusFilter !== 'all'
              ? `No ${statusFilter} publications found`
              : 'No publications found'}
          </p>
          <Button onClick={() => router.push('/dashboard/new')}>
            Create Publication
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedIds.length === publications.length && publications.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds(publications.map(p => p.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publications.map((publication) => (
                <TableRow key={publication.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(publication.id)}
                      onCheckedChange={(checked) => {
                        setSelectedIds(
                          checked
                            ? [...selectedIds, publication.id]
                            : selectedIds.filter((id) => id !== publication.id)
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{publication.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {publication.content}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        publication.status
                      )}`}
                    >
                      {publication.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(publication.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/edit/${publication.id}`)
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(publication.id, 'published')
                          }
                        >
                          Mark as Published
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(publication.id, 'draft')}
                        >
                          Mark as Draft
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(publication.id, 'archived')
                          }
                        >
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(publication.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}