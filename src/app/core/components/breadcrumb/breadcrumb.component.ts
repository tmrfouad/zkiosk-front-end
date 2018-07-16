import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {
  url: string;
  siteMap = {
    '/': 'Home',
    '/product': 'Products'
  };

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
    this.router.events.subscribe((navEnd: NavigationEnd) => {
      this.url = this.router.url;
    });
  }

}
