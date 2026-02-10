import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AuthService } from '../services/auth.service';

@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {

    constructor(
        @Inject('BASE_API_URL') private baseUrl: string,
        private authService: AuthService) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if(request.url.startsWith('http')) {
            return next.handle(request);
        }
        const token = localStorage.getItem('JWT_Token');
        let apiReq = request.clone({ url: `${this.baseUrl}/${request.url}` });
        if (token) {
            apiReq = apiReq.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
        }
        return next.handle(apiReq).pipe(
            catchError((error) => {
                if (error.status === 401) {
                    this.authService.logout();
                }
                return throwError(() => error);
            })
        );
    }
}