# 💬 Chats Feature - User Guide

## Overview
The new Chats feature allows users to see all their conversations in one place and easily continue chatting with pet owners and helpers.

## How to Access
1. **From Navigation Bar**: Click on "Chats" in the main navigation
2. **From Report Details**: Click "Contact" on any report to start a chat
3. **Direct Link**: Navigate to `/chats`

## Features

### 📱 Chats List Page (`/chats`)
- **View All Conversations**: See all your active chats sorted by most recent activity
- **Search Functionality**: Search conversations by pet name or contact name
- **Unread Message Indicators**: Red badges show unread message counts
- **Quick Actions**: Easy access to browse more reports or create new ones
- **Pet Context**: Each chat shows the related pet's photo and report type (lost/found)

### 💬 Chat Interface
- **Real-time Messaging**: Send and receive messages instantly
- **Message History**: View complete conversation history
- **Timestamp Display**: See when messages were sent
- **Read Status**: Track which messages have been read
- **Responsive Design**: Works perfectly on mobile and desktop

### 🔄 Integration
- **Seamless Navigation**: Jump between chats and report details
- **Context Preservation**: Chat state is maintained across page navigation
- **Auto-open**: Chats open automatically when accessed from the chats list

## User Flow Example

1. **User sees a lost pet report** → Clicks "I think this is my pet!"
2. **Chat opens** → User sends initial message
3. **Later, user wants to check messages** → Goes to Chats page
4. **Sees conversation with unread badge** → Clicks to continue chat
5. **Chat reopens** → User can continue the conversation

## Mock Data Included
- Sample conversation between a pet finder and owner
- Demonstrates unread message functionality
- Shows proper timestamp formatting
- Includes pet context and report information

## Technical Implementation
- **State Management**: Zustand store for chat persistence
- **Real-time Updates**: Automatic message synchronization
- **Performance**: Efficient filtering and sorting
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Benefits
- **Centralized Communication**: All pet-related conversations in one place
- **Better User Experience**: No need to remember which reports have active chats
- **Improved Engagement**: Easy access encourages continued communication
- **Mobile-Friendly**: Optimized for on-the-go pet searching and communication