select properties.*, avg(rating) as average_rating from properties 
inner join property_reviews on property_id=properties.id
where city='Vancouver' 
group by properties.id
having avg(rating)>= 4
order by cost_per_night
limit 10;
