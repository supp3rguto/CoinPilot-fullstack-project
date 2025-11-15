import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Socket } from 'ngx-socket-io';
import { MatToolbarModule } from '@angular/material/toolbar'; 
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatTableModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit { 
  
  private API_URL = 'http://localhost:3000';

  public products: any[] = []; 
  public lastDemand: number | null = null; 
  public isLoading: boolean = true;

  public displayedColumns: string[] = ['name', 'basePrice', 'currentPrice'];

  constructor(private http: HttpClient, private socket: Socket) {}

  ngOnInit() {

    this.http.get<any[]>(`${this.API_URL}/products`)
      .subscribe(data => {
        this.products = data; 
        this.isLoading = false; 
      });

    this.socket.fromEvent<any>('price-update')
      .subscribe(data => {
        this.isLoading = false;
        this.products = data.products; 
        this.lastDemand = data.demand; 
      });
  }
}