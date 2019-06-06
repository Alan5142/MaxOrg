import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  index = 0;
  speed = 4000;
  infinite = true;
  direction = 'right';
  directionToggle = true;
  autoplay = true;
  avatars = [
    {url: '/images/logos/people-admin.png', title: 'MaxOrg le ayuda a enfocarse en lo que realmente importa: el desarrollo de su proyecto'},
    {url: '/images/logos/people-admin.jpg', title: 'Con las herramientas brindadas usted podrá organizar fácilmente a sus equipos de trabajo'},
    {url: '/images/logos/kanban-board.png', title: 'Gestione sus actividades mediante el uso de un tablero kanban'},
    {url: '/images/logos/github.png', title: 'Integre con GitHub para tener a la mano su código sin salir de la plataforma'},
    {url: '/images/logos/org-chart.png', title: 'Divida y vencerá, MaxOrg le permite organizar grupos en forma jerárquica'},
    {url: '/images/logos/stats.png', title: 'Obtenga estádisticas y porcentaje de tareas terminadas'},
    {url: '/images/logos/tests.png', title: 'Realice pruebas automaticas a su código y escriba reportes de las mismas'},
    {url: '/images/logos/chat.jpeg', title: 'Dialogue con los integrantes de su equipo'},
  ];

  constructor() {
  }

  ngOnInit() {
  }

}
