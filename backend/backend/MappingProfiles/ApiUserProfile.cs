using AutoMapper;
using backend.Data.Entities;
using backend.Models.Requests;
using backend.Models.Responses;

namespace backend.MappingProfiles;

public class ApiUserProfile : Profile
{
    public ApiUserProfile()
    {
        CreateMap<RegisterRequest, ApiUser>();
        
        CreateMap<ApiUser, LoginResponseUser>();
        CreateMap<ApiUser, UserResponse>();
    }
}