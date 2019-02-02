import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-github-login',
  templateUrl: './github-login.component.html',
  styleUrls: ['./github-login.component.scss']
})
export class GithubLoginComponent implements OnInit {
  public codeParam: string;

  constructor(activatedRoute: ActivatedRoute,
              private userService: UserService,
              private router: Router) {
    activatedRoute.queryParamMap.subscribe(params => {
      this.codeParam = params.get('code');
      if (this.codeParam) {
        this.userService.githubLogin(this.codeParam)
          .subscribe(loginResult => {
            console.log(loginResult);
            if (loginResult.valid) {
              if (loginResult.firstLogin) {
                alert('Cambia tus datos en "Mi cuenta"');
              }
              this.router.navigate(['/start/index']);
            } else {
              this.router.navigate(['/']);
            }
          }, error => {
            console.log(error);
            alert('El correo ya esta vinculado a una cuenta pero no esta vinculado a una cuenta de GitHub, vinculala desde opciones');
            this.router.navigate(['/']);
          });
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  ngOnInit() {
  }

}
