using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using ArangoDB.Client;
using MaxOrg.Models.Group;
using MaxOrg.Models.Tests;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace MaxOrg.Utility
{
    public class DevOpsHelper
    {
        private static string GetApiUrlForProject(string orgName, string projectName)
        {
            return $"https://dev.azure.com/{orgName}/{projectName}/_apis";
        }

        public static async Task<TokenResponse> GetAccessToken(IConfiguration configuration, string code,
            HttpClient httpClient)
        {
            var requestMessage =
                new HttpRequestMessage(HttpMethod.Post, configuration["AppSettings:DevOps:TokenExchange"]);
            requestMessage.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var form = new Dictionary<string, string>
            {
                {"client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"},
                {"client_assertion", configuration["AppSettings:DevOps:ClientSecret"]},
                {"grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer"},
                {"assertion", code},
                {"redirect_uri", configuration["AppSettings:DevOps:RedirectUrl"]}
            };
            requestMessage.Content = new FormUrlEncodedContent(form);

            var responseMessage = await httpClient.SendAsync(requestMessage);

            if (!responseMessage.IsSuccessStatusCode) return null;
            var body = await responseMessage.Content.ReadAsStringAsync();

            var tokenModel = JsonConvert.DeserializeObject<TokenResponse>(body);
            return tokenModel;
        }

        private static async Task<TokenResponse> RefreshToken(IConfiguration configuration, string refreshToken,
            HttpClient httpClient)
        {
            var requestMessage =
                new HttpRequestMessage(HttpMethod.Post, configuration["AppSettings:DevOps:TokenExchange"]);
            requestMessage.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var form = new Dictionary<string, string>
            {
                {"client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"},
                {"client_assertion", configuration["AppSettings:DevOps:ClientSecret"]},
                {"grant_type", "refresh_token"},
                {"assertion", refreshToken},
                {"redirect_uri", configuration["AppSettings:DevOps:RedirectUrl"]}
            };
            requestMessage.Content = new FormUrlEncodedContent(form);

            var responseMessage = await httpClient.SendAsync(requestMessage);

            if (!responseMessage.IsSuccessStatusCode) return null;
            var body = await responseMessage.Content.ReadAsStringAsync();

            var tokenModel = JsonConvert.DeserializeObject<TokenResponse>(body);
            return tokenModel;
        }

        public static async Task<string> GetAccessToken(IConfiguration configuration, Group group,
            HttpClient httpClient,
            IArangoDatabase database)
        {
            if (!group.DevOpsExpirationTime.HasValue) return null;
            if ((group.DevOpsExpirationTime.Value - DateTime.UtcNow).Seconds > 0)
            {
                return group.DevOpsToken;
            }

            var token = await RefreshToken(configuration, group.DevOpsRefreshToken, httpClient);
            group.DevOpsRefreshToken = token.RefreshToken;
            group.DevOpsToken = token.AccessToken;
            group.DevOpsExpirationTime = DateTime.UtcNow.AddSeconds(3000);
            await database.UpdateByIdAsync<Group>(group.Id, group);
            return token.AccessToken;
        }

        public static async Task<int> CreateBuild(string accessToken, string orgName, string projectName,
            HttpClient httpClient, int definition)
        {
            var requestMessage =
                new HttpRequestMessage(HttpMethod.Post,
                    $"{GetApiUrlForProject(orgName, projectName)}/build/builds?api-version=5.0");
            requestMessage.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            var message = new
            {
                definition = new
                {
                    id = definition
                }
            };
            requestMessage.Content = new StringContent(JsonConvert.SerializeObject(message));
            requestMessage.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

            var responseMessage = await httpClient.SendAsync(requestMessage);
            var responseString = await responseMessage.Content.ReadAsStringAsync();
            if (!responseMessage.IsSuccessStatusCode) return -1;
            dynamic response = JsonConvert.DeserializeObject(responseString);

            return response.id;
        }

        public static async Task<BuildDefinitionResponse> GetBuildDefinitions(string accessToken, string orgName,
            string projectName, HttpClient httpClient)
        {
            var requestMessage =
                new HttpRequestMessage(HttpMethod.Get,
                    $"{GetApiUrlForProject(orgName, projectName)}/build/definitions?api-version=5.0");
            requestMessage.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            requestMessage.Content = new StringContent("");
            requestMessage.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            var responseMessage = await httpClient.SendAsync(requestMessage);
            var responseString = await responseMessage.Content.ReadAsStringAsync();
            return !responseMessage.IsSuccessStatusCode
                ? null
                : JsonConvert.DeserializeObject<BuildDefinitionResponse>(responseString);
        }

        public static async Task<TestRunResponse> GetBuildResult(string accessToken, string orgName, string projectName,
            int buildId, HttpClient httpClient)
        {
            var requestMessage =
                new HttpRequestMessage(HttpMethod.Get,
                    $"{GetApiUrlForProject(orgName, projectName)}/test/runs" +
                    $"?api-version=5.0&buildUri=vstfs:///Build/Build/{buildId}");
            requestMessage.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            requestMessage.Content = new StringContent("");
            requestMessage.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            var responseMessage = await httpClient.SendAsync(requestMessage);
            var responseString = await responseMessage.Content.ReadAsStringAsync();
            return !responseMessage.IsSuccessStatusCode ? null : JsonConvert.DeserializeObject<TestRunResponse>(responseString);
        }
    }
}