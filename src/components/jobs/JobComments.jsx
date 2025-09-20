import React, { useState, useEffect, useCallback } from 'react';
import { Comment } from '@/api/entities';
import { User } from '@/api/entities';
import { Notification } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare, AtSign, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import HousePartyEffect from '../effects/HousePartyEffect';

export default function JobComments({ job }) {
    const [comments, setComments] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [commentAuthors, setCommentAuthors] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [mentionedUsers, setMentionedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [mentionSearch, setMentionSearch] = useState('');
    const [showParty, setShowParty] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [commentsData, usersData, currentUserData] = await Promise.all([
                Comment.filter({ job_id: job.id }, '-created_date'),
                User.list(),
                User.me()
            ]);
            
            setComments(commentsData);
            setAllUsers(usersData);
            setCurrentUser(currentUserData);

            const authorIds = [...new Set(commentsData.map(c => c.author_id))];
            const authors = {};
            for (const id of authorIds) {
                if (!authors[id]) {
                    const user = usersData.find(u => u.id === id);
                    if (user) authors[id] = user;
                }
            }
            setCommentAuthors(authors);

        } catch (error) {
            console.error("Error fetching comments data:", error);
        } finally {
            setLoading(false);
        }
    }, [job.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleMention = (user) => {
        if (!mentionedUsers.some(mu => mu.id === user.id)) {
            setMentionedUsers([...mentionedUsers, user]);
            setNewComment(prev => `${prev}@${user.full_name.replace(' ', '')} `);
        }
        setMentionSearch('');
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        setPosting(true);
        try {
            const mentioned_user_ids = mentionedUsers
                .filter(user => newComment.includes(`@${user.full_name.replace(' ', '')}`))
                .map(user => user.id);

            const comment = await Comment.create({
                job_id: job.id,
                author_id: currentUser.id,
                content: newComment,
                mentioned_user_ids
            });

            // Send notifications for mentions
            for (const userId of mentioned_user_ids) {
                if (userId !== currentUser.id) { // Don't notify yourself
                    await Notification.create({
                        recipient_id: userId,
                        sender_id: currentUser.id,
                        job_id: job.id,
                        comment_id: comment.id,
                        type: 'mention',
                        content: `You were mentioned in a note on job ${job.claim_number} by ${currentUser.full_name}.`
                    });
                }
            }

            setNewComment('');
            setMentionedUsers([]);
            fetchData();
        } catch (error) {
            console.error("Error posting comment:", error);
        } finally {
            setPosting(false);
        }
    };
    
    const handleCommentChange = (e) => {
        const value = e.target.value;
        if (value.toUpperCase().includes('HOUSEPARTY')) {
            setShowParty(true);
            setNewComment(value.replace(/houseparty/ig, ''));
        } else {
            setNewComment(value);
        }
    };

    if (loading) {
        return <div className="h-48 w-full bg-slate-100 rounded-lg animate-pulse"></div>;
    }
    
    const filteredUsersForMention = allUsers.filter(user => 
        user.full_name.toLowerCase().includes(mentionSearch.toLowerCase()) &&
        !mentionedUsers.some(mu => mu.id === user.id)
    );

    return (
        <div className="flex flex-col h-full space-y-4 relative">
            {showParty && <HousePartyEffect onComplete={() => setShowParty(false)} />}
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-slate-500" />
                Notes & Communication
            </h3>
            
            <div className="flex items-start gap-3">
                 <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-500 font-medium text-sm">
                        {currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : '?'}
                    </span>
                </div>
                <div className="flex-1">
                    <Textarea 
                        value={newComment}
                        onChange={handleCommentChange}
                        placeholder="Leave a note. Use '@' to mention a colleague."
                        className="bg-white border-slate-300"
                        rows={3}
                    />
                    <div className="flex justify-between items-center mt-2">
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-800">
                                    <AtSign className="w-4 h-4 mr-1.5" />
                                    Mention User
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-0">
                                <div className="p-2">
                                     <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input 
                                            placeholder="Search user..."
                                            value={mentionSearch}
                                            onChange={(e) => setMentionSearch(e.target.value)}
                                            className="pl-8 h-9"
                                        />
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {filteredUsersForMention.map(user => (
                                        <div key={user.id} onClick={() => handleMention(user)} className="flex items-center gap-2 p-2 hover:bg-slate-100 cursor-pointer text-sm">
                                            <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium text-slate-600">
                                                {user.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            <span>{user.full_name}</span>
                                        </div>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Button onClick={handlePostComment} disabled={posting || !newComment.trim()}>
                            {posting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Post Note
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {comments.map(comment => {
                    const author = commentAuthors[comment.author_id];
                    return (
                        <div key={comment.id} className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-slate-500 font-medium text-sm">
                                    {author?.full_name ? author.full_name.charAt(0).toUpperCase() : '?'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-800 text-sm">{author?.full_name || 'Unknown User'}</span>
                                    <span className="text-xs text-slate-400">
                                        {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        </div>
                    );
                })}
                {comments.length === 0 && !loading && (
                    <div className="text-center py-8 text-slate-500 text-sm h-full flex flex-col items-center justify-center">
                        <MessageSquare className="w-10 h-10 text-slate-400 mb-4"/>
                        <span>No notes or comments on this job yet.</span>
                    </div>
                )}
            </div>
        </div>
    );
}