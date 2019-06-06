import {Component, OnInit} from '@angular/core';
import {ProjectsService, Requirement, RequirementType} from "../../services/projects.service";
import {ActivatedRoute, Router} from "@angular/router";
import {merge, Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";
import {MatDialog, MatSnackBar, Sort} from "@angular/material";
import {EditRequirementComponent} from "./edit-requirement/edit-requirement.component";
import {RemoveRequirementComponent} from "./remove-requirement/remove-requirement.component";
import {ReadOnlyService} from "../services/read-only.service";

@Component({
  selector: 'app-requirements',
  templateUrl: './requirements.component.html',
  styleUrls: ['./requirements.component.scss']
})
export class RequirementsComponent implements OnInit {
  displayedColumns: string[] = ['description', 'progress', 'creationDate', 'actions'];

  projectId = '';

  requirements: Observable<Requirement[]>;
  functionalRequirements: Observable<Requirement[]>;
  nonFunctionalRequirements: Observable<Requirement[]>;

  constructor(private projectService: ProjectsService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              activatedRouter: ActivatedRoute,
              private router:Router,
              public readOnly: ReadOnlyService) {
    activatedRouter.parent.params.subscribe(params => {
      this.projectId = params['id'];
      this.requirements = this.projectService.getProjectRequirements(this.projectId).pipe(shareReplay(1));

      this.functionalRequirements = this.requirements.pipe(map<Requirement[], Requirement[]>(values => {
        let functValues=values.filter(value => value.requirementType == RequirementType.Functional);
        functValues.forEach(requirement=>{
          projectService.getRequirementProgress(this.projectId,requirement.id).subscribe((progress:number)=>{
            requirement.progress=progress;
          })
        });
        return functValues;
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

  referenceRequirement(requirementId){
    localStorage.setItem("taskRequirement",requirementId);
    this.router.navigate(["/project/"+this.projectId+"/assigned-work"]);
  }
}
