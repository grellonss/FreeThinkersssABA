using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
using Moq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using CulturalGuideBACKEND.Controllers;
using CulturalGuideBACKEND.Data;
using CulturalGuideBACKEND.Models;
using CulturalGuideBACKEND.Services.Email;

namespace CulturalGuideBACKEND.Tests.Controllers
{
    public class AuthControllerTests : IDisposable
    {
        private readonly AppDbContext _dbContext;
        private readonly AuthController _authController;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IConfiguration _configuration;
        private readonly Mock<IEmailService> _emailServiceMock;
        
        private const string TEST_EMAIL = "unittest@example.com";
        private const string TEST_PASSWORD = "Password123";
        private const string TEST_NAME = "Unit Test User";

        public AuthControllerTests()
        {
            // Setup in-memory database
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _dbContext = new AppDbContext(options);

            // Setup configuration
            var inMemorySettings = new Dictionary<string, string?>
            {
                {"Jwt:Key", "your-256-bit-secret-key-for-testing-purposes-only-must-be-long-123456"},
                {"Jwt:Issuer", "TestIssuer"},
                {"Jwt:Audience", "TestAudience"},
                {"Jwt:ExpireMinutes", "60"}
            };

            _configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();

            // Setup password hasher
            _passwordHasher = new PasswordHasher<User>();

            // Setup email service mock
            _emailServiceMock = new Mock<IEmailService>();
            _emailServiceMock
                .Setup(e => e.SendVerificationEmail(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            // Create controller
            _authController = new AuthController(
                _dbContext,
                _configuration,
                _passwordHasher,
                _emailServiceMock.Object
            );

            // Setup HttpContext for cookies
            var httpContext = new DefaultHttpContext();
            _authController.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };
        }

        [Fact]
        public async Task Register_NewUser_ReturnsOkResult()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Name = TEST_NAME,
                Email = TEST_EMAIL,
                Password = TEST_PASSWORD
            };

            // Act
            var result = await _authController.Register(registerRequest);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.Value.Should().NotBeNull();

            // Verify user was created in database
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == TEST_EMAIL);
            user.Should().NotBeNull();
            user!.Name.Should().Be(TEST_NAME);
        }

        [Fact]
        public async Task Register_ExistingUser_ReturnsConflict()
        {
            // Arrange - Create existing user
            var existingUser = new User
            {
                Email = TEST_EMAIL,
                Name = "Existing User",
                IsVerified = true
            };
            existingUser.PasswordHash = _passwordHasher.HashPassword(existingUser, TEST_PASSWORD);
            
            _dbContext.Users.Add(existingUser);
            await _dbContext.SaveChangesAsync();

            var registerRequest = new RegisterRequest
            {
                Name = TEST_NAME,
                Email = TEST_EMAIL,
                Password = TEST_PASSWORD
            };

            // Act
            var result = await _authController.Register(registerRequest);

            // Assert
            result.Should().BeOfType<ConflictObjectResult>();
        }

        [Fact]
        public void Login_ValidCredentials_ReturnsOkWithToken()
        {
            // Arrange - Create user
            var user = new User
            {
                Email = TEST_EMAIL,
                Name = TEST_NAME,
                IsVerified = true
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, TEST_PASSWORD);
            
            _dbContext.Users.Add(user);
            _dbContext.SaveChanges();

            var loginRequest = new LoginRequest
            {
                Email = TEST_EMAIL,
                Password = TEST_PASSWORD
            };

            // Act
            var result = _authController.Login(loginRequest);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult!.Value.Should().NotBeNull();
        }

        [Fact]
        public void Login_InvalidPassword_ReturnsUnauthorized()
        {
            // Arrange - Create user
            var user = new User
            {
                Email = TEST_EMAIL,
                Name = TEST_NAME,
                IsVerified = true
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, TEST_PASSWORD);
            
            _dbContext.Users.Add(user);
            _dbContext.SaveChanges();

            var loginRequest = new LoginRequest
            {
                Email = TEST_EMAIL,
                Password = "WrongPassword123"
            };

            // Act
            var result = _authController.Login(loginRequest);

            // Assert
            result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task DeleteUser_ExistingUser_ReturnsOk()
        {
            // Arrange - Create user
            var user = new User
            {
                Email = TEST_EMAIL,
                Name = TEST_NAME,
                IsVerified = true
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, TEST_PASSWORD);
            
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            var userId = user.Id;

            // Act
            var result = _authController.DeleteUser(userId);

            // Assert
            if (result is StatusCodeResult statusResult)
            {
                statusResult.StatusCode.Should().Be(200);
            }
            else if (result is OkResult)
            {
                Assert.True(true); // OkResult is equivalent to 200
            }
            else if (result is ObjectResult objectResult)
            {
                objectResult.StatusCode.Should().Be(200);
            }
            else
            {
                Assert.Fail($"Expected 200 OK but got {result?.GetType().Name}");
            }

            // Verify user was deleted
            var deletedUser = await _dbContext.Users.FindAsync(userId);
            deletedUser.Should().BeNull();
        }

        [Fact]
        public void DeleteUser_NonExistingUser_ReturnsNotFound()
        {
            // Arrange
            var nonExistentUserId = 99999;

            // Act
            var result = _authController.DeleteUser(nonExistentUserId);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task Register_InvalidModelState_ReturnsBadRequest()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Name = TEST_NAME,
                Email = "invalid-email",
                Password = TEST_PASSWORD
            };
            _authController.ModelState.AddModelError("Email", "Invalid email format");

            // Act
            var result = await _authController.Register(registerRequest);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        public void Dispose()
        {
            _dbContext.Database.EnsureDeleted();
            _dbContext.Dispose();
        }
    }
}