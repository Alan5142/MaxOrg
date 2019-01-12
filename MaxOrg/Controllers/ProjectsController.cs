using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ArangoDB.Client;
using MaxOrg.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MaxOrg.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {
        private readonly IArangoDatabase m_database;
        
        public ProjectsController(IArangoDatabase database)
        {
            m_database = database;
        }

        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] ProjectCreationData data)
        {
            var currentDate = DateTime.Now;

            var currentUser = await (from u in m_database.Query<User>()
                                     where u.Key == HttpContext.User.Identity.Name
                                     select u).FirstOrDefaultAsync();
            if (currentUser == null)
            {
                return Unauthorized();
            }

            var groupGraph = m_database.Graph("GroupUsersGraph");

            // obtenemos los usuarios
            var usersToAdd = from u in m_database.Query<User>()
                             from ud in data.Members
                             where u.Username == ud
                             select u;

            if (data.Members.Count != usersToAdd.Count())
            {
                return BadRequest(new { message = "Some users are invalid" });
            }

            var projectGroup = new Group
            {
                CreationDate = currentDate,
                Name = data.Name,
                GroupOwner = HttpContext.User.Identity.Name,
                IsRoot = true
            };
            var createdGroup = await m_database.InsertAsync<Group>(projectGroup); ;

            var admin = new UsersInGroup
            {
                IsAdmin = true,
                JoinDate = currentDate,
                Group = createdGroup.Id,
                User = "User/" + currentUser.Key,
                AddedBy = currentUser.Username
            };
            // create a relation between root group and the creator
            await groupGraph.InsertEdgeAsync<UsersInGroup>(admin);

            foreach (var user in usersToAdd)
            {
                var userToAdd = new UsersInGroup
                {
                    IsAdmin = false,
                    JoinDate = currentDate,
                    Group = createdGroup.Id,
                    User = "User/" + user.Key,
                    AddedBy = currentUser.Username
                };
                await groupGraph.InsertEdgeAsync<UsersInGroup>(userToAdd);
            }

            // TODO trigger notification

            return Created("/api/projects/" + createdGroup.Key, null);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProject(string id)
        {
            var project = await (from p in m_database.Query<Group>()
                          where p.Key == id && p.IsRoot == true
                          select p).FirstOrDefaultAsync();
            if (project == null)
            {
                return NotFound();
            }
            var graph = m_database.Graph("GroupUsersGraph");
            var traversal = m_database.Traverse<User, UsersInGroup>(new TraversalConfig
            {
                StartVertex = project.Id,
                GraphName = graph.Name,
                Direction = EdgeDirection.Inbound,
                MinDepth = 1,
                MaxDepth = 1
            });
            var members = from u in traversal.Visited.Vertices
                                 select new { u.Key, u.Username };
            if (members.Where(u => u.Key == HttpContext.User.Identity.Name).Count() == 0)
            {
                return NotFound();
            }
            var subgrp = GetSubgroupHierarchy(project.Key);

            var subgroups = m_database.Traverse<Group, Subgroup>(new TraversalConfig
            {
                StartVertex = project.Id,
                GraphName = "SubgroupGraph",
                Direction = EdgeDirection.Outbound,
                MinDepth = 1
            });

            var returnMessage = new
            {
                project.Key,
                project.Name,
                project.Description,
                project.GroupOwner,
                project.CreationDate,
                members,
                subgroups = subgrp
            };
            return Ok(returnMessage);
        }

        private GroupHierarchy[] GetSubgroupHierarchy(string projectId)
        {
            // first subgroups
            var subgroups = GetSubgroups(projectId);
            foreach (var subgroup in subgroups)
            {
                subgroup.Subgroups = GetSubgroupHierarchy(subgroup.Id);
            }
            return subgroups;
        }

        private GroupHierarchy[] GetSubgroups(string groupId)
        {
            var subgroups = m_database.Traverse<Group, Subgroup>(new TraversalConfig
            {
                StartVertex = "Group/" + groupId,
                GraphName = "SubgroupGraph",
                Direction = EdgeDirection.Outbound,
                MinDepth = 1,
                MaxDepth = 1
            }).Visited.Vertices.Select(g => new GroupHierarchy // we map this subgroups to a group hierarchy structure
            {
                Id = g.Key,
                Name = g.Name,
                Description = g.Description,
                GroupOwner = g.GroupOwner,
                CreationDate = g.CreationDate
            });
            return subgroups.ToArray();
        }
    }
}