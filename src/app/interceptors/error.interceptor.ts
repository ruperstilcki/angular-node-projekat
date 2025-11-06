import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, throwError } from 'rxjs';
import { ErrorComponent } from '../error/error.component';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const dialog = inject(MatDialog);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('Error intercepted:', error);
      dialog.open(ErrorComponent, {
        data: {
          message: error.error?.message || 'An unknown error occurred!'
        }
      });
      return throwError(() => new Error(error.error?.message || 'An unknown error occurred!'));
    })
  );
};
