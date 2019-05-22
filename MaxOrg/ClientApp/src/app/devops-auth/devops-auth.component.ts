import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TestsService} from "../services/tests.service";
import {MatSnackBar} from "@angular/material";

@Component({
  selector: 'app-devops-auth',
  templateUrl: './devops-auth.component.html',
  styleUrls: ['./devops-auth.component.scss']
})
export class DevopsAuthComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private tests: TestsService,
              private snackbar: MatSnackBar) {
    this.activatedRoute.queryParamMap.subscribe(params => {
      console.log(params);
      const code = params.get('code');
      const state = params.get('state');
      this.tests.linkToken(state, code).subscribe(r => {
        this.router.navigate(['/project/', state]);
        this.snackbar.open('Vinculado con exito', 'Ok', {duration: 2000});
      }, () => {
        this.snackbar.open('No se pudo vincular', 'Ok', {duration: 2000});
        this.router.navigate(['/']);
      });
    })
  }

  ngOnInit() {
  }

}
