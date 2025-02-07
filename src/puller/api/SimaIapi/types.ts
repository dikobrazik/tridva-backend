export type IapiReviewsResponse = {
  items: IapiReviewItem[];
  meta: Meta;
  sorts: Sort[];
};

type Sort = {
  name: string;
  value: string;
};

type Meta = {
  totalCount: number;
  pageCount: number;
  currentPage: number;
  perPage: number;
};

export type IapiReviewItem = {
  answer: null;
  author: string;
  date: string;
  hasItemPurchased: boolean;
  id: number;
  modifiersInfo: ModifiersInfo;
  photos?: Photo[];
  rating: Rating;
  reactions: Reaction[];
  showThumbs: boolean;
  status: Status;
  text: string;
  userId: number;
  reactionIds?: number[];
};

type Status = {
  text: string;
  type: string;
};

type Reaction = {
  canChange: boolean;
  id: number;
  isLike: boolean;
  reviewId: number;
  userId: number;
};

type Rating = {
  availability: boolean;
  value: number;
};

type Photo = {
  alt: string;
  id: number;
  reviewId: number;
  src: string;
};

type ModifiersInfo = {
  modifiers: string[];
  url: string;
};
