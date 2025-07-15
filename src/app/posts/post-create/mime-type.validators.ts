// mime-type.validators.ts

import { AbstractControl } from '@angular/forms';
import { Observable, Observer, of } from 'rxjs';

/**
 * Async Validator for validating file mime types (image only).
 * Checks the first few bytes of the uploaded file to detect PNG or JPEG formats.
 * This prevents users from uploading files with fake extensions.
 */
export const mimeType = (
  control: AbstractControl
): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any } | null> => {
  // If the value is a string (e.g., existing image path in edit mode), validation passes
  if (typeof control.value === 'string') {
    return of(null);
  }

  const file = control.value as File;

  // If value is not a valid file object, skip validation
  if (typeof file === 'string' || !file) {
    return new Observable((observer) => {
      observer.next(null);
      observer.complete();
    });
  }

  // Read the file bytes to validate actual mime type
  const fileReader = new FileReader();
  const frObs = new Observable((observer: Observer<{ [key: string]: any } | null>) => {
    fileReader.addEventListener('loadend', () => {
      const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4);
      let header = '';
      let isValid = false;

      // Build hex string from first 4 bytes
      for (const element of arr) {
        header += element.toString(16);
      }

      // Compare file header against known image mime signatures
      switch (header) {
        case '89504e47': // PNG
        case 'ffd8ffe0': // JPEG
        case 'ffd8ffe1':
        case 'ffd8ffe2':
        case 'ffd8ffe3':
        case 'ffd8ffe8':
          isValid = true;
          break;
        default:
          break;
      }

      // Emit validation result
      if (isValid) {
        observer.next(null); // Valid file
      } else {
        observer.next({ invalidMimeType: true }); // Invalid mime type
      }
      observer.complete();
    });

    // Start reading the file as binary array buffer
    fileReader.readAsArrayBuffer(file);
  });

  return frObs;
};
