"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import api from '@/app/lib/axios';
import { toast } from 'sonner';
import { Trash2, Loader2 } from 'lucide-react';
import { Note } from '@/type/note.type';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuth } from '@/app/context/AuthContext';
type NotesTabProps = {
    lessonId: string;
};

const NotesTab: React.FC<NotesTabProps> = ({ lessonId }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
    const isMobile = useIsMobile();
    const { user } = useAuth();
    const fetchNotes = useCallback(async () => {
        if (!lessonId) return; 
        setIsLoading(true);
        try {
            const response = await api.get(`/notes/my-notes/lesson/${lessonId}`);
            const data = response.data.data ?? [];
            setNotes(data);
        } catch (error) {
            console.error('Error fetching notes:', error);
            toast.error('Không thể tải ghi chú');
        } finally {
            setIsLoading(false);
        }
    }, [lessonId]);
    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNoteContent.trim()) {
            toast.error('Vui lòng nhập nội dung ghi chú');
            return;
        }
        setIsSubmitting(true);
        try {
            if (user?.id) {
                const response = await api.post('/notes/create', {
                    lesson_id: lessonId,
                    user_id: user.id,
                    content: newNoteContent
                });
                setNotes(prev => [response.data, ...prev]);
                setNewNoteContent('');
                await fetchNotes();
                toast.success('Tạo ghi chú thành công!');
            }

        } catch (error) {
            console.error('Error creating note:', error);
            toast.error('Không thể tạo ghi chú');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        try {
            await api.delete(`/notes/${noteId}`);
            setNotes(prev => prev.filter(note => note.note_id !== noteId));
            toast.success('Xóa ghi chú thành công!');
        } catch (error) {
            console.error('Error deleting note:', error);
            toast.error('Không thể xóa ghi chú');
        } finally {
            setDeleteNoteId(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div>
            <Tabs defaultValue="list" className="w-full">
                <TabsList className={`${isMobile ? `flex gap-3 pl-4` : 'flex gap-3'}`}>
                    <TabsTrigger
                        value="list"
                        className='pl-2 cursor-pointer border 
                        data-[state=active]:border-pink-600 data-[state=active]:text-pink-600'>
                        Ghi chú của tôi
                    </TabsTrigger>
                    <TabsTrigger
                        value="create"
                        className='pl-2 cursor-pointer data-[state=active]:border-pink-600 data-[state=active]:text-pink-600'>
                        Thêm ghi chú mới
                    </TabsTrigger>
                    <TabsTrigger
                        value="list-chapters-for-mobile"
                        className={`${isMobile ? 'pl-2 cursor-pointer data-[state=active]:border-pink-600 data-[state=active]:text-pink-600'
                            : 'pl-2 cursor-pointer data-[state=active]:border-pink-600 data-[state=active]:text-pink-600 hidden'}`
                        }>
                        Danh sách bài học
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="list" className='pl-5 pt-3'>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
                        </div>
                    ) : notes.length === 0 ? (
                        <p className="text-gray-500">Bạn chưa có ghi chú nào ở bài học này</p>
                    ) : (
                        <div className="space-y-4">
                            {notes.map((note) => (
                                <div key={note.note_id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm text-gray-500">{formatDate(note.createAt)}</span>
                                        <Button variant="ghost"
                                            size="sm"
                                            onClick={() => setDeleteNoteId(note.note_id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="create" className='pl-5'>
                    <form onSubmit={handleCreateNote} className='flex gap-5 justify-baseline flex-col'>
                        <Textarea
                            placeholder='Thêm ghi chú của bạn vào đây...'
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                            rows={6}
                            disabled={isSubmitting}
                        />
                        <Button
                            type="submit"
                            className='cursor-pointer inline-block align-bottom text-pink-700 border border-pink-700 bg-white hover:bg-pink-500 hover:text-white'
                            disabled={isSubmitting || !newNoteContent.trim()}>
                            {isSubmitting ? (
                                <div>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                    Đang lưu...
                                </div>
                            ) : (
                                'Tạo ghi chú'
                            )}
                        </Button>
                    </form>
                </TabsContent>

                <TabsContent value='list-chapters-for-mobile'>
                    <div></div>
                </TabsContent>
            </Tabs>

            <AlertDialog open={!!deleteNoteId} onOpenChange={() => setDeleteNoteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa ghi chú</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa ghi chú này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteNoteId && handleDeleteNote(deleteNoteId)}
                            className="bg-red-600 hover:bg-red-700">
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default NotesTab;
