using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace CulturalGuideBACKEND.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        public async Task SendTypingIndicator(string userId, bool isTyping)
        {
            await Clients.User(userId).SendAsync("TypingIndicator", isTyping);
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst("sub")?.Value 
                         ?? Context.User?.FindFirst("email")?.Value;
            
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
            }
            
            await base.OnConnectedAsync();
        }
    }
}