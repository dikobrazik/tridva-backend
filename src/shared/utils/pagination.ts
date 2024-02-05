const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

export const getPaginationFields = (
  page: number = DEFAULT_PAGE,
  pageSize: number = DEFAULT_PAGE_SIZE,
) => {
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
};
