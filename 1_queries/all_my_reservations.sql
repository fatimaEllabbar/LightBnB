select properties.*,reservations.* ,avg(rating) as average_rating from properties 
inner join reservations on reservations.property_id=properties.id
inner join property_reviews on property_reviews.property_id=properties.id
inner join users on users.id=reservations.guest_id
where users.id=1 and end_date < now()
group by properties.id , reservations.id
order by start_date
limit 10;

