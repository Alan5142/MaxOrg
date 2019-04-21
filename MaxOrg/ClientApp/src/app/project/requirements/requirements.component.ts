import {Component, OnInit, ViewChild} from '@angular/core';
import {ProjectsService, Requirement, RequirementType} from "../../services/projects.service";
import {ActivatedRoute} from "@angular/router";
import {merge, Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";
import {MatDialog, MatSnackBar, MatSort, MatTableDataSource, Sort, SortDirection} from "@angular/material";
import {EditRequirementComponent} from "./edit-requirement/edit-requirement.component";
import {RemoveRequirementComponent} from "./remove-requirement/remove-requirement.component";

@Component({
  selector: 'app-requirements',
  templateUrl: './requirements.component.html',
  styleUrls: ['./requirements.component.scss']
})
export class RequirementsComponent implements OnInit {
  displayedColumns: string[] = ['description', 'creationDate', 'actions'];

  projectId = '';

  dataSource = [
    {description: 'Requerimiento 1', creationDate: new Date()},
    {description: 'Requerimiento 2', creationDate: new Date()},
    {description: 'Requerimiento 3', creationDate: new Date()},
    {description: 'Requerimiento 4', creationDate: new Date()},
    {description: 'Requerimiento 5', creationDate: new Date()},
    {description: 'Requerimiento 6', creationDate: new Date()},
    {description: 'Requerimiento 7', creationDate: new Date()},
    {description: 'Requerimiento 8', creationDate: new Date()},
    {description: 'Requerimiento 9', creationDate: new Date()},
    {description: 'Requerimiento 10', creationDate: new Date()},
  ];

  requirements: Observable<Requirement[]>;
  functionalRequirements: Observable<Requirement[]>;
  nonFunctionalRequirements: Observable<Requirement[]>;

  constructor(private projectService: ProjectsService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              activatedRouter: ActivatedRoute) {
    activatedRouter.parent.params.subscribe(params => {
      this.projectId = params['id'];
      this.requirements = this.projectService.getProjectRequirements(this.projectId).pipe(shareReplay(1));

      this.functionalRequirements = this.requirements.pipe(map<Requirement[], Requirement[]>(values => {
        return values.filter(value => value.requirementType == RequirementType.Functional);
      }));

      this.nonFunctionalRequirements = this.requirements.pipe(map<Requirement[], Requirement[]>(values => {
        return values.filter(value => value.requirementType == RequirementType.NonFunctional);
      }));
    });
  }

  ngOnInit() {
  }

  createRequirement(name: string, requirementType: RequirementType) {
    if (name.length === 0) {
      return;
    }
    this.projectService.createRequirement(this.projectId, {
      description: name,
      type: requirementType
    }).subscribe(() => {
      this.snackBar.open('Requerimiento creado con exito', 'OK', {
        duration: 2000
      });
      const newRequirements = this.projectService.getProjectRequirements(this.projectId).pipe(shareReplay(1));
      this.requirements = merge(this.requirements, newRequirements);

      this.functionalRequirements = this.requirements.pipe(map<Requirement[], Requirement[]>(values => {
        return values.filter(value => value.requirementType == RequirementType.Functional);
      }));

      this.nonFunctionalRequirements = this.requirements.pipe(map<Requirement[], Requirement[]>(values => {
        return values.filter(value => value.requirementType == RequirementType.NonFunctional);
      }));

    }, error => {
      this.snackBar.open('No se pudo crear el requerimiento', 'OK', {duration: 2000});
    });
  }

  sortFunctional(sort: Sort) {
    switch (sort.direction) {
      case 'asc':
        this.functionalRequirements = this.functionalRequirements.pipe(map<Requirement[], Requirement[]>(values => {
          return values.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
        }));
        break;
      case 'desc':
        this.functionalRequirements = this.functionalRequirements.pipe(map<Requirement[], Requirement[]>(values => {
          return values.sort((a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime());
        }));
        break;
    }
  }

  sortNonFunctional(sort: Sort) {
    switch (sort.direction) {
      case 'asc':
        this.nonFunctionalRequirements = this.nonFunctionalRequirements.pipe(map<Requirement[], Requirement[]>(values => {
          return values.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
        }));
        break;
      case 'desc':
        this.nonFunctionalRequirements = this.nonFunctionalRequirements.pipe(map<Requirement[], Requirement[]>(values => {
          return values.sort((a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime());
        }));
        break;
    }
  }

  editRequirement(id: string) {
    const dialogRef = this.dialog.open(EditRequirementComponent, {width: '300px'});
    dialogRef.afterClosed().subscribe(result => {
      if (result === null || result === undefined)
        return;
      this.projectService.modifyProjectRequirement(this.projectId, id, result.description).subscribe(() => {
        this.snackBar.open('Modificado con exito', 'OK', {duration: 2000});

        const newRequirements = this.projectService.getProjectRequirements(this.projectId).pipe(shareReplay(1));
        this.requirements = merge(this.requirements, newRequirements);

        this.functionalRequirements = this.requirements.pipe(map<Requirement[], Requirement[]>(values => {
          return values.filter(value => value.requirementType == RequirementType.Functional);
        }));

        this.nonFunctionalRequirements = this.requirements.pipe(map<Requirement[], Requirement[]>(values => {
          return values.filter(value => value.requirementType == RequirementType.NonFunctional);
        }));

      }, () => {
        this.snackBar.open('No se pudo modificar', 'OK', {duration: 2000});
      });
    });
  }

  deleteRequirement(id: string) {
    const dialogRef = this.dialog.open(RemoveRequirementComponent, {width: '300px'});
    dialogRef.afterClosed().subscribe(result => {
      if (result === null || result === undefined)
        return;
      this.projectService.deleteProjectRequirement(this.projectId, id).subscribe(() => {
        this.snackBar.open('Eliminado con exito', 'OK', {duration: 2000});

        const newRequirements = this.projectService.getProjectRequirements(this.projectId).pipe(shareReplay(1));
        this.requirements = merge(this.requirements, newRequirements);

        this.functionalRequirements = this.requirements.pipe(map<Requirement[], Requirement[]>(values => {
          return values.filter(value => value.requirementType == RequirementType.Functional);
        }));

        this.nonFunctionalRequirements = this.requirements.pipe(map<Requirement[], Requirement[]>(values => {
          return values.filter(value => value.requirementType == RequirementType.NonFunctional);
        }));

      }, () => {
        this.snackBar.open('No se pudo eliminar', 'OK', {duration: 2000});
      });
    });
  }
}
