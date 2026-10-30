using System.ComponentModel.DataAnnotations;

namespace CulturalGuideBACKEND.Models
{
    public class EatAndDrink
    {
        [Required]
        public int Id { get; set; }
        [Required]
        public string EntityName { get; set; }
        [Required]
        public string ImagePath { get; set; }
        [Required]
        public string BadgeText { get; set; }
        [Required]
        public string Address { get; set; }
    }
}