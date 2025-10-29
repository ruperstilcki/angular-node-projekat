import { PageEvent } from '@angular/material/paginator';

export const createPageEvent = (pageIndex = 0, pageSize = 2, length = 0): PageEvent => ({
  pageIndex,
  pageSize,
  length
});
