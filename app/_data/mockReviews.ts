export interface Review {
  readonly id: string;
  readonly partnerName: string;
  readonly partnerAvatar: string;
  readonly rating: 1 | 2 | 3 | 4 | 5;
  readonly comment: string;
  readonly timeAgo: string;
  readonly skillExchanged: string;
}

export const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    partnerName: 'Maria Garcia',
    partnerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    rating: 5,
    comment: 'Alex is an incredibly skilled graphic designer! He helped me with my website\'s visual branding, and the results were beyond my expectations. Highly recommended!',
    timeAgo: '2 weeks ago',
    skillExchanged: 'Graphic Design'
  },
  {
    id: '2',
    partnerName: 'David Lee',
    partnerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rating: 4,
    comment: 'Had a great swap with Alex for some coding help. He\'s knowledgeable and explains things clearly. A bit slow on initial communication, but overall a good experience.',
    timeAgo: '1 month ago',
    skillExchanged: 'Web Development'
  },
  {
    id: '3',
    partnerName: 'Sophia Khan',
    partnerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    rating: 5,
    comment: 'Alex helped me troubleshoot my laptop. He was quick, efficient, and super friendly. Definitely swapping with him again!',
    timeAgo: '2 months ago',
    skillExchanged: 'Tech Support'
  },
  {
    id: '4',
    partnerName: 'Carlos Ramirez',
    partnerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    rating: 4,
    comment: 'Good experience learning Python from Alex. He adapted the lesson to my pace. Very patient. Would recommend for beginners.',
    timeAgo: '3 months ago',
    skillExchanged: 'Python Programming'
  },
  {
    id: '5',
    partnerName: 'Emily Chen',
    partnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    rating: 5,
    comment: 'Fantastic mentor! Alex taught me UI design principles and gave me practical tips I could use immediately. Very professional and friendly.',
    timeAgo: '3 months ago',
    skillExchanged: 'UI/UX Design'
  },
  {
    id: '6',
    partnerName: 'James Wilson',
    partnerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    rating: 5,
    comment: 'Alex is a great communicator and teacher. He helped me understand complex coding concepts in simple terms. Highly skilled!',
    timeAgo: '4 months ago',
    skillExchanged: 'JavaScript'
  }
];

export const validateReviews = (reviews: readonly Review[]): boolean => {
  if (!Array.isArray(reviews)) return false;
  
  return reviews.every(review => 
    review?.id && 
    review?.partnerName && 
    typeof review?.rating === 'number' && 
    review?.rating >= 1 && 
    review?.rating <= 5 &&
    review?.comment &&
    review?.timeAgo &&
    review?.skillExchanged
  );
};