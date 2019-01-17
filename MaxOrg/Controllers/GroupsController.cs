﻿using ArangoDB.Client;
using MaxOrg.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Threading.Tasks;

namespace MaxOrg.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class GroupsController : ControllerBase
    {
        private readonly IArangoDatabase m_database;

        public GroupsController(IArangoDatabase database)
        {
            m_database = database;
        }

        [HttpPost]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupRequest createGroup)
        {
            var currentDate = DateTime.Now;

            // user is not admin
            if (!await IsGroupAdmin(createGroup.CurrentGroupId, HttpContext.User.Identity.Name))
            {
                return Unauthorized();
            }
            // Subgroup admin doesn't exist
            var subgroupAdmin = await m_database.Query<User>().Where(u => u.Key == createGroup.SubgroupAdminId).FirstOrDefaultAsync();
            if (subgroupAdmin == null)
            {
                return BadRequest(new { message = "Invalid subgroup admin" });
            }

            var groupGraph = m_database.Graph("GroupUsersGraph");

            var usersToAdd = from u in m_database.Query<User>()
                             from ud in createGroup.Members
                             where u.Username == ud
                             select u;

            var groupMembers = GetGroupMembers(createGroup.CurrentGroupId);

            if (groupMembers.Find(u => u.Key == createGroup.SubgroupAdminId) == null)
            {
                return BadRequest(new { message = "Invalid subgroup admin id" });
            }

            usersToAdd = from u in usersToAdd
                         from um in groupMembers
                         where u.Key == um.Key
                         select u;

            // Mismatch, some users are not valid
            if (createGroup.Members.Count != usersToAdd.Count())
            {
                return BadRequest(new { message = "Some users are invalid" });
            }

            var newGroup = new Group
            {
                CreationDate = currentDate,
                Name = createGroup.Name,
                GroupOwner = createGroup.SubgroupAdminId,
                IsRoot = false
            };

            var createdGroup = await m_database.InsertAsync<Group>(newGroup);

            var currentUser = await (from u in m_database.Query<User>()
                                     where u.Key == HttpContext.User.Identity.Name
                                     select u).FirstOrDefaultAsync();

            var currentGroup = await (from g in m_database.Query<Group>()
                                      where g.Key == createGroup.CurrentGroupId
                                      select g).FirstOrDefaultAsync();
            var subgroup = new Subgroup
            {
                Parent = currentGroup.Id,
                Child = createdGroup.Id
            };
            var subgroupGraph = m_database.Graph("SubgroupGraph");
            await subgroupGraph.InsertEdgeAsync<Subgroup>(subgroup);

            var admin = new UsersInGroup
            {
                IsAdmin = true,
                JoinDate = currentDate,
                Group = createdGroup.Id,
                User = "User/" + subgroupAdmin.Key,
                AddedBy = currentUser.Key
            };
            await groupGraph.InsertEdgeAsync<UsersInGroup>(admin);

            usersToAdd = usersToAdd.Where(u => u.Key != subgroupAdmin.Key).Select(u => u);

            foreach (var user in usersToAdd)
            {
                var userToAdd = new UsersInGroup
                {
                    IsAdmin = false,
                    JoinDate = currentDate,
                    Group = createdGroup.Id,
                    User = user.Id,
                    AddedBy = subgroupAdmin.Key
                };
                await groupGraph.InsertEdgeAsync<UsersInGroup>(userToAdd);
            }

            return Created("api/groups/" + createdGroup.Key, null);
        }

        [HttpGet("{groupId}")]
        public async Task<IActionResult> GetGroupInfo(string groupId)
        {
            var group = await (from g in m_database.Query<Group>()
                               where g.Key == groupId && g.IsRoot == false
                               select g).FirstOrDefaultAsync();
            if (group == null)
            {
                return NotFound();
            }
            var members = GetGroupMembers(groupId).Select(u => new { u.Key, u.Username, u.Email });

            return Ok(new { group.Name, group.Key, group.GroupOwner, group.CreationDate, group.Description, members });
        }

        [HttpGet("{groupId}/boards")]
        public async Task<IActionResult> GetBoardsOfGroup(string groupId)
        {
            var kanbanBoards = await (from g in m_database.Query<Group>()
                                      from kb in g.KanbanBoards
                                      where g.Key == groupId && kb.Members.Contains(HttpContext.User.Identity.Name)
                                      select g.KanbanBoards).FirstOrDefaultAsync();
            if (kanbanBoards == null)
            {
                return NotFound();
            }
            // send only names

            return Ok(new
            {
                boards = from kb in kanbanBoards
                         select new { kb.Name, kb.Id }
            });
        }

        [HttpGet("{groupId}/boards/{boardId}")]
        public async Task<IActionResult> GetBoardWithName(string groupId, string boardId)
        {
            var kanbanBoard = (await (from g in m_database.Query<Group>()
                                     from kb in g.KanbanBoards
                                     where g.Key == groupId && kb.Members.Contains(HttpContext.User.Identity.Name) && kb.Id == boardId
                                     select g).FirstOrDefaultAsync()).KanbanBoards.FirstOrDefault();
            if (kanbanBoard == null)
            {
                return NotFound();
            }
            return Ok(kanbanBoard);

        }

        private async Task<bool> IsGroupAdmin(string currentGroup, string userId)
        {
            var graph = m_database.Graph("GroupUsersGraph");

            var user = await (from u in m_database.Query<User>()
                              where u.Key == userId
                              select u).FirstOrDefaultAsync();
            var traversal = m_database.Traverse<User, UsersInGroup>(new TraversalConfig
            {
                StartVertex = "Group/" + currentGroup,
                GraphName = graph.Name,
                Direction = EdgeDirection.Inbound,
                MinDepth = 1,
                MaxDepth = 1
            });
            return (from u in traversal.Visited.Paths
                    from e in u.Edges
                    where e.User == "User/" + userId
                    select e.IsAdmin).FirstOrDefault();
        }

        private List<User> GetGroupMembers(string groupId)
        {
            var graph = m_database.Graph("GroupUsersGraph");

            var traverse = m_database.Traverse<User, UsersInGroup>(new TraversalConfig
            {
                StartVertex = "Group/" + groupId,
                GraphName = graph.Name,
                Direction = EdgeDirection.Inbound,
                MinDepth = 1,
                MaxDepth = 1
            });

            return traverse.Visited.Vertices;
        }


    }
}