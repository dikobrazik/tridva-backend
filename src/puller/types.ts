export type Credentials = {
    phone: string;
    password: string;
};

export type SimaCategory = {
    id: number;
    name: string;
    slug: string;
    level: number;
    path: string;
    is_leaf: boolean;
    is_adult: boolean;
    icon: string;
  }