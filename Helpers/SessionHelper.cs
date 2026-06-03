using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PimsApp.Data;
using PimsApp.Models;
using System.Linq;

namespace PimsApp.Helpers
{
    public static class SessionHelper
    {
        private const string UserRoleKey = "CurrentUserRole";
        private const string UserIdKey = "CurrentUserId";
        private const string UserNameKey = "CurrentUserName";

        public static User GetCurrentUser(ISession session, PimsDbContext db)
        {
            var role = session.GetString(UserRoleKey);
            var userIdVal = session.GetInt32(UserIdKey);

            if (string.IsNullOrEmpty(role) || !userIdVal.HasValue)
            {
                // Default to OPPDC (Maria Santos, UserId 2)
                var defaultUser = db.Users.FirstOrDefault(u => u.Role == "OPPDC") 
                    ?? new User { UserId = 2, Name = "Maria Santos", Email = "oppdc@pims.gov.ph", Role = "OPPDC" };
                
                SetCurrentUser(session, defaultUser);
                return defaultUser;
            }

            var user = db.Users.FirstOrDefault(u => u.UserId == userIdVal.Value);
            if (user == null)
            {
                var defaultUser = db.Users.FirstOrDefault(u => u.Role == "OPPDC")
                    ?? new User { UserId = 2, Name = "Maria Santos", Email = "oppdc@pims.gov.ph", Role = "OPPDC" };
                SetCurrentUser(session, defaultUser);
                return defaultUser;
            }

            return user;
        }

        public static void SetCurrentUser(ISession session, User user)
        {
            session.SetString(UserRoleKey, user.Role);
            session.SetInt32(UserIdKey, user.UserId);
            session.SetString(UserNameKey, user.Name);
        }

        public static void SwitchRole(ISession session, string role, PimsDbContext db)
        {
            var user = db.Users.FirstOrDefault(u => u.Role == role);
            if (user != null)
            {
                SetCurrentUser(session, user);
            }
        }
    }
}
