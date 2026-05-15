/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type IssueType = 'pothole' | 'flooding' | 'power_outage' | 'fire' | 'light_failure' | 'garbage' | 'other';

export interface UrbanIssue {
  id: string;
  type: IssueType;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  imageUrl?: string;
  reporterId: string;
  reporterName: string;
  createdAt: number;
  status: 'pending' | 'in_progress' | 'solved';
  likesCount: number;
  likedBy: string[];
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: number;
}
