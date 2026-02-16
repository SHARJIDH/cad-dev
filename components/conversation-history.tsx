"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Message } from '@/lib/store';
import { Bot, User } from 'lucide-react';

interface ConversationHistoryProps {
    messages: Message[];
    className?: string;
}

export function ConversationHistory({ messages, className }: ConversationHistoryProps) {
    if (!messages || messages.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Conversation History</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        No conversation history yet. Start by generating a design!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Conversation History</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${
                                    message.role === 'user' ? 'flex-row-reverse' : ''
                                }`}
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                        {message.role === 'user' ? (
                                            <User className="h-4 w-4" />
                                        ) : (
                                            <Bot className="h-4 w-4" />
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    className={`flex-1 space-y-1 ${
                                        message.role === 'user' ? 'items-end' : ''
                                    }`}
                                >
                                    <div
                                        className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                            message.role === 'user'
                                                ? 'bg-primary text-primary-foreground ml-auto'
                                                : 'bg-muted'
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                    </div>
                                    <p className="text-xs text-muted-foreground px-2">
                                        {new Date(message.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
