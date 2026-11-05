-- Stable key per category, used by the frontend for illustrations and the "missing category" hint.
alter table dish_categories add column slug text unique;

update dish_categories set slug = v.slug
from (values ('סלטים ומטבלים', 'salads'), ('עיקריות', 'mains'), ('דגים', 'fish'),
             ('תוספות ולחמים', 'sides'), ('קינוחים', 'desserts'), ('שתייה', 'drinks')) as v(name, slug)
where dish_categories.name = v.name;
