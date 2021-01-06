select city , count(reservations.id) as number_of_reservations from properties 
inner join reservations on property_id= properties.id
group by city
order by number_of_reservations desc;
