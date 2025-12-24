# EduLearn Admin Panel

A minimal and modern admin panel for managing EduLearn rewards, certificates, and IPFS uploads.

## Features

- 🎨 **Modern Design**: Uses the same dark theme design as the main web app with #00FF80 accent color
- 🏆 **Reward Management**: Create, view, and delete rewards
- 📊 **Dashboard Stats**: Quick overview of total rewards, certificates, and points
- 🔗 **IPFS Integration**: Upload metadata to IPFS using Pinata with one click
- 🖼️ **Image Support**: Add image URLs for reward certificates
- ⚡ **Real-time Updates**: Instant feedback with success/error notifications

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm installed
- EduLearn API running (default: http://localhost:3001)
- Pinata account with API credentials

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your credentials:
   - `NEXT_PUBLIC_API_URL`: Your EduLearn API URL
   - `NEXT_PUBLIC_PINATA_JWT`: Your Pinata JWT token
   - `NEXT_PUBLIC_PINATA_GATEWAY`: Your Pinata gateway domain

### Getting Pinata Credentials

1. Go to [Pinata App](https://app.pinata.cloud/register)
2. Create a free account
3. Navigate to "API Keys" in the sidebar
4. Click "New Key" with Admin privileges
5. Copy the JWT token
6. Go to "Gateways" tab to get your gateway domain

### Running the App

Development mode:
```bash
pnpm dev
```

Production build:
```bash
pnpm build
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Reward

1. Click "Create New Reward" button
2. Fill in the form:
   - **Type**: Choose between Certificate or Points
   - **Title**: Name of the reward
   - **Description**: Detailed description
   - **Image URL**: Direct URL to the reward image
   - **IPFS Metadata**: Can be manually entered or auto-generated

3. To auto-generate IPFS metadata:
   - Fill in Title, Description, and Image URL
   - Click "Upload to IPFS" button
   - The metadata will be uploaded to Pinata and the URL will be auto-filled

4. Click "Create Reward" to save

### Managing Rewards

- View all rewards in the main list
- Each reward shows:
  - Title and type badge
  - Description
  - Image preview (if available)
  - IPFS metadata link
  - Creation date
- Delete rewards using the trash icon

## Design System

The admin panel matches the EduLearn web app design:

- **Background**: Dark theme (#0a0a0a)
- **Accent Color**: #00FF80 (bright green)
- **Card Background**: #1a1a1a
- **Text**: White for primary, #B3B3B3 for secondary
- **Borders**: Subtle dark borders with transparency
- **Hover Effects**: Smooth transitions with accent color highlights

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **IPFS Storage**: Pinata SDK
- **State Management**: Zustand (for future expansions)

## API Endpoints Used

- `GET /rewards` - Fetch all rewards
- `POST /rewards` - Create new reward
- `DELETE /rewards/:id` - Delete reward
- `POST /rewards/award` - Award reward to user
- `GET /rewards/recipients/:rewardId` - Get reward recipients

## Notes

- Authentication is handled via Bearer token stored in localStorage
- All API calls require authentication
- IPFS uploads happen directly from the client to Pinata
- Form validation ensures required fields are filled

## Support

For issues or questions, contact: dave@edulearn.fun
