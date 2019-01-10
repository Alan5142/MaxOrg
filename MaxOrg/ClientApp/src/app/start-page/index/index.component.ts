import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  constructor(activatedRoute: ActivatedRoute,
              private userService: UserService,
              private router: Router) {
    activatedRoute.queryParamMap.subscribe(params => {
      const codeParam = params.get('code');
      if (codeParam) {
        this.userService.githubLogin(codeParam)
          .subscribe(loginResult => {
              if (loginResult) {
                this.router.navigate(['/start/index']);
              }
            },
            error => {
              console.log(error);
              alert('No se pudo iniciar sesión con GitHub');
            });
      }
    });
  }

  ngOnInit() {
  }

}
