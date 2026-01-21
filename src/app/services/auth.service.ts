import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import detectEthereumProvider from '@metamask/detect-provider';
import { catchError, from, of, Subject, switchMap } from 'rxjs';

interface NonceResponse {
  nonce: string;
}

interface VerifyResponse {
  access_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoggedIn: boolean = false;
  private unauthorizedSubject = new Subject<void>();
  public unauthorized$ = this.unauthorizedSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('JWT_Token');
    if(token) {
      this.isLoggedIn = true;
    }
  }

  public signInWithMetaMask() {
    let ethereum: any;

    return from(detectEthereumProvider()).pipe(
      
      // Step 1: Request (limited) access to users ethereum account
      switchMap(async (provider) => {
        if (!provider) {
          throw new Error('Please install MetaMask');
        }

        ethereum = provider;

        return await ethereum.request({ method: 'eth_requestAccounts' });
      }),
      // Step 2: Retrieve the current nonce for the requested address
      switchMap(() =>
        this.http.post<NonceResponse>(
          'ether-sign/sign',
          {
            address: ethereum.selectedAddress,
          }
        )
      ),
      // Step 3: Get the user to sign the nonce with their private key
      switchMap( async (response) =>
            
        await ethereum.request({
          method: 'personal_sign',
          params: [
            `0x${this.toHex(response.nonce)}`,
            ethereum.selectedAddress,
          ],
        })

      ),
      // Step 4: If the signature is valid, retrieve a custom auth token for Firebase
      switchMap((sig) =>
        this.http.post<VerifyResponse>(
          'ether-sign/verify',
          { address: ethereum.selectedAddress, signature: sig }
        )
      ),
      // Step 5: Use the auth token to auth with Firebase
      switchMap(
        async (response) => {
          localStorage.setItem('JWT_Token', response.access_token);
          localStorage.setItem('User_Address', ethereum.selectedAddress);
          this.isLoggedIn = true;
      })
      
    );
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }

  getUserAddress(): string | null {
    return localStorage.getItem('User_Address');
  }

  logout(): void {
    this.isLoggedIn = false;
    localStorage.removeItem('JWT_Token');
    localStorage.removeItem('User_Address');
    this.unauthorizedSubject.next();
  }

  private toHex(stringToConvert: string) {
    return stringToConvert
      .split('')
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  }
}
