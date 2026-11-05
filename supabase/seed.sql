-- Generated from database/sqlite/catering.db. Sample data for development only.
set timezone = 'Asia/Jerusalem';

insert into customers (id, auth_user_id, full_name, email, phone, created_at, updated_at) values
  ('10b63184-26bb-5775-96f3-b1346ad8314a', null, 'נועה לוי', 'noa@example.com', '050-1234567', '2026-11-02 11:01:44', '2026-11-02 11:01:44'),
  ('87c69ec4-7446-591a-8dbb-707e3c4013d7', null, 'יוסי כהן', 'yossi@example.com', '052-7654321', '2026-11-02 11:01:44', '2026-11-02 11:01:44');

insert into events (id, customer_id, event_type, event_date, adults, children, vegetarian_guests, vegan_guests, restricted_guests, dietary_notes) values
  ('1b311e74-d0db-55cb-a3b4-4835c3a5813c', '10b63184-26bb-5775-96f3-b1346ad8314a', 'בר או בת מצווה', '2026-12-10', '30', '8', '4', '2', '1', 'אורח אחד עם אלרגיה לאגוזים'),
  ('9558fef2-f31f-56ed-8276-87bfbec90f3c', '87c69ec4-7446-591a-8dbb-707e3c4013d7', 'יום הולדת', '2026-11-20', '25', '10', '4', '0', '0', null);

insert into dish_categories (id, name, sort_order, is_active) values
  ('2e0f4476-36a1-5bd7-acd0-dc01ac0b9a4a', 'סלטים ומטבלים', '1', '1'),
  ('ce39cb1a-752a-53e1-8163-dd1cf75fa7fc', 'עיקריות', '2', '1'),
  ('981da75a-3ce7-5fc2-8236-324d672f594d', 'דגים', '3', '1'),
  ('e55aef5a-a455-5265-839b-78821427411a', 'תוספות ולחמים', '4', '1'),
  ('8341ee12-f562-5738-aa35-719ac12cb26c', 'קינוחים', '5', '1'),
  ('c37bec92-46fa-5af4-ba66-a441a7d1811a', 'שתייה', '6', '1');

insert into dishes (id, category_id, name, description, image_path, pricing_unit, unit_price, unit_label, currency, min_quantity, is_available, created_at, updated_at) values
  ('28d3263b-cabe-54d2-8724-6d110b4f2da3', '2e0f4476-36a1-5bd7-acd0-dc01ac0b9a4a', 'חומוס ביתי', 'חומוס חם עם טחינה גולמית, שמן זית ופפריקה.', null, 'per_tray', '85', 'מגש', 'ILS', null, '1', '2026-11-02 11:01:44', '2026-11-02 11:01:44'),
  ('81b803ef-74ef-5512-949b-798d625e08c2', '2e0f4476-36a1-5bd7-acd0-dc01ac0b9a4a', 'סלט חצילים קלויים', 'חצילים שרופים על האש עם טחינה, לימון ופטרוזיליה.', null, 'per_tray', '90', 'מגש', 'ILS', null, '1', '2026-11-02 11:01:44', '2026-11-02 11:01:44'),
  ('fdf2e3f1-c35d-52eb-a4b2-a4f3cfcf2e04', '2e0f4476-36a1-5bd7-acd0-dc01ac0b9a4a', 'סלט סלק וגבינת עיזים', 'סלק אפוי, גבינת עיזים, אגוזי מלך וויניגרט הדרים.', null, 'per_tray', '110', 'מגש', 'ILS', null, '1', '2026-11-02 11:01:44', '2026-11-02 11:01:44'),
  ('b8bc1442-38cc-5544-89de-a68770bb7c3a', '2e0f4476-36a1-5bd7-acd0-dc01ac0b9a4a', 'טבולה פטרוזיליה', 'פטרוזיליה קצוצה, בורגול, עגבניות ולימון.', null, 'per_tray', '80', 'מגש', 'ILS', null, '1', '2026-11-02 11:01:44', '2026-11-02 11:01:44'),
  ('951f8d70-374d-575b-a025-317e5db9f953', 'ce39cb1a-752a-53e1-8163-dd1cf75fa7fc', 'עוף בתנור בעשבי תיבול', 'ירכי עוף אפויות עם שום, רוזמרין ולימון.', null, 'per_weight', '74', 'ק״ג', 'ILS', null, '1', '2026-11-02 11:01:44', '2026-11-02 11:01:44'),
  ('d8039c33-f50d-5210-95b7-d481ba9858bf', 'ce39cb1a-752a-53e1-8163-dd1cf75fa7fc', 'קציצות בקר ברוטב עגבניות', 'קציצות בקר רכות ברוטב עגבניות וכוסברה.', null, 'per_tray', '240', 'מגש', 'ILS', null, '1', '2026-11-02 11:01:44', '2026-11-02 11:01:44'),
  ('be6034c6-6422-5c55-8885-eea3ac429f95', 'ce39cb1a-752a-53e1-8163-dd1cf75fa7fc', 'פשטידת ברוקולי וגבינות', 'פשטידה אפויה עם ברוקולי ושלוש גבינות.', null, 'per_tray', '190', 'מגש', 'ILS', null, '1', '2026-11-02 11:01:44', '2026-11-02 11:01:44'),
  ('d47fb135-65d4-5d2b-8cfb-396d63eaf453', 'ce39cb1a-752a-53e1-8163-dd1cf75fa7fc', 'תבשיל קדרה צמחי', 'ירקות עונה, חומוס ותבלינים בבישול איטי.', null, 'per_tray', '170', 'מגש', 'ILS', null, '1', '2026-11-02 11:01:44', '2026-11-02 11:01:44'),
  ('0912aee1-6f91-5999-a683-00a71f1725e1', '981da75a-3ce7-5fc2-8236-324d672f594d', 'פילה סלמון בלימון', 'פילה סלמון אפוי עם לימון, שמיר ושמן זית.', null, 'per_item', '98', 'יחידה', 'ILS', null, '1', '2026-11-02 11:01:44', '2026-11-02 11:01:44'),
  ('e20df674-8891-528c-8acc-7260ad36b879', '981da75a-3ce7-5fc2-8236-324d672f594d', 'דג מושט בצ׳רמולה', 'דג מושט שלם בתנור עם צ׳רמולה ביתית.', null, 'per_weight', '145', 'ק״ג', 'ILS', null, '1', '2026-11-02 11:01:44', '2026-11-02 11:01:44'),
  ('a5b854f4-cb9f-57db-8ac7-5af054b81024', 'e55aef5a-a455-5265-839b-78821427411a', 'אורז בסמטי ושקדים', 'אורז בסמטי עם שקדים קלויים ובצל מקורמל.', null, 'per_tray', '120', 'מגש', 'ILS', null, '1', '2026-11-02 11:01:44', '2026-11-02 11:01:44'),
  ('d900bc2a-800f-5f74-8a79-d6699abaf985', 'e55aef5a-a455-5265-839b-78821427411a', 'ירקות שורש קלויים', 'גזר, בטטה וסלק קלויים עם דבש או סילאן.', null, 'per_tray', '105', 'מגש', 'ILS', null, '1', '2026-11-02 11:01:44', '2026-11-02 11:01:44'),
  ('5d72e28e-630f-5f3d-a425-bf8fd6c92511', 'e55aef5a-a455-5265-839b-78821427411a', 'פוקאצ׳ה ביתית', 'פוקאצ׳ה אפויה עם רוזמרין ומלח גס.', null, 'per_item', '18', 'יחידה', 'ILS', null, '1', '2026-11-02 11:01:44', '2026-11-02 11:01:44'),
  ('b4119dd8-1bf7-50ee-8d34-8162e27b1c79', '8341ee12-f562-5738-aa35-719ac12cb26c', 'עוגת שוקולד ללא קמח', 'עוגת שוקולד מריר לחה, 12 פרוסות.', null, 'per_item', '160', 'יחידה', 'ILS', null, '1', '2026-11-02 11:01:44', '2026-11-02 11:01:44'),
  ('3a231ce1-2acd-5990-8ff5-e6c3279498b9', '8341ee12-f562-5738-aa35-719ac12cb26c', 'פלטת פירות העונה', 'פירות טריים חתוכים, לכ-10 סועדים.', null, 'per_item', '140', 'יחידה', 'ILS', null, '1', '2026-11-02 11:01:44', '2026-11-02 11:01:44'),
  ('27b57217-ed2f-5659-8e5d-7ee6d91bdd0d', '8341ee12-f562-5738-aa35-719ac12cb26c', 'מיני טארטלטים', 'טארטלטים עם קרם וניל ופירות יער.', null, 'per_item', '9', 'יחידה', 'ILS', null, '1', '2026-11-02 11:01:44', '2026-11-02 11:01:44'),
  ('b280caa0-d656-55ca-aa4a-cf5a6614ac33', 'c37bec92-46fa-5af4-ba66-a441a7d1811a', 'שתייה קלה ומים', 'מבחר שתייה קלה ומים מינרליים לכל אורח.', null, 'per_guest', '14', 'לאורח', 'ILS', null, '1', '2026-11-02 11:01:44', '2026-11-02 11:01:44');

insert into dish_dietary (dish_id, kashrut_class, is_vegetarian, is_vegan, verified_at) values
  ('28d3263b-cabe-54d2-8724-6d110b4f2da3', 'pareve', '1', '1', '2026-10-01'),
  ('81b803ef-74ef-5512-949b-798d625e08c2', 'pareve', '1', '1', '2026-10-01'),
  ('fdf2e3f1-c35d-52eb-a4b2-a4f3cfcf2e04', 'dairy', '1', '0', '2026-10-01'),
  ('b8bc1442-38cc-5544-89de-a68770bb7c3a', 'pareve', '1', '1', '2026-10-01'),
  ('951f8d70-374d-575b-a025-317e5db9f953', 'meat', '0', '0', '2026-10-01'),
  ('d8039c33-f50d-5210-95b7-d481ba9858bf', 'meat', '0', '0', '2026-10-01'),
  ('be6034c6-6422-5c55-8885-eea3ac429f95', 'dairy', '1', '0', '2026-10-01'),
  ('d47fb135-65d4-5d2b-8cfb-396d63eaf453', 'pareve', '1', '1', '2026-10-01'),
  ('0912aee1-6f91-5999-a683-00a71f1725e1', 'pareve', '0', '0', '2026-10-01'),
  ('e20df674-8891-528c-8acc-7260ad36b879', 'pareve', '0', '0', '2026-10-01'),
  ('a5b854f4-cb9f-57db-8ac7-5af054b81024', 'pareve', '1', '1', '2026-10-01'),
  ('d900bc2a-800f-5f74-8a79-d6699abaf985', 'pareve', '1', '1', '2026-10-01'),
  ('5d72e28e-630f-5f3d-a425-bf8fd6c92511', 'pareve', '1', '1', '2026-10-01'),
  ('b4119dd8-1bf7-50ee-8d34-8162e27b1c79', 'pareve', '1', '0', '2026-10-01'),
  ('3a231ce1-2acd-5990-8ff5-e6c3279498b9', 'pareve', '1', '1', '2026-10-01'),
  ('27b57217-ed2f-5659-8e5d-7ee6d91bdd0d', 'dairy', '1', '0', '2026-10-01'),
  ('b280caa0-d656-55ca-aa4a-cf5a6614ac33', 'pareve', '1', '1', '2026-10-01');

insert into allergens (id, name) values
  ('1', 'גלוטן'),
  ('2', 'אגוזים'),
  ('3', 'חלב'),
  ('4', 'ביצים'),
  ('5', 'שומשום'),
  ('6', 'דגים');

insert into dish_allergens (dish_id, allergen_id, status) values
  ('28d3263b-cabe-54d2-8724-6d110b4f2da3', '5', 'contains'),
  ('fdf2e3f1-c35d-52eb-a4b2-a4f3cfcf2e04', '3', 'contains'),
  ('fdf2e3f1-c35d-52eb-a4b2-a4f3cfcf2e04', '2', 'contains'),
  ('b8bc1442-38cc-5544-89de-a68770bb7c3a', '1', 'contains'),
  ('d8039c33-f50d-5210-95b7-d481ba9858bf', '1', 'contains'),
  ('d8039c33-f50d-5210-95b7-d481ba9858bf', '4', 'contains'),
  ('be6034c6-6422-5c55-8885-eea3ac429f95', '3', 'contains'),
  ('be6034c6-6422-5c55-8885-eea3ac429f95', '1', 'contains'),
  ('be6034c6-6422-5c55-8885-eea3ac429f95', '4', 'contains'),
  ('0912aee1-6f91-5999-a683-00a71f1725e1', '6', 'contains'),
  ('e20df674-8891-528c-8acc-7260ad36b879', '6', 'contains'),
  ('a5b854f4-cb9f-57db-8ac7-5af054b81024', '2', 'contains'),
  ('5d72e28e-630f-5f3d-a425-bf8fd6c92511', '1', 'contains'),
  ('b4119dd8-1bf7-50ee-8d34-8162e27b1c79', '4', 'contains'),
  ('b4119dd8-1bf7-50ee-8d34-8162e27b1c79', '2', 'contains'),
  ('27b57217-ed2f-5659-8e5d-7ee6d91bdd0d', '3', 'contains'),
  ('27b57217-ed2f-5659-8e5d-7ee6d91bdd0d', '1', 'contains'),
  ('27b57217-ed2f-5659-8e5d-7ee6d91bdd0d', '4', 'contains'),
  ('81b803ef-74ef-5512-949b-798d625e08c2', '1', 'free'),
  ('81b803ef-74ef-5512-949b-798d625e08c2', '2', 'free'),
  ('81b803ef-74ef-5512-949b-798d625e08c2', '3', 'free'),
  ('81b803ef-74ef-5512-949b-798d625e08c2', '4', 'free'),
  ('81b803ef-74ef-5512-949b-798d625e08c2', '5', 'free'),
  ('81b803ef-74ef-5512-949b-798d625e08c2', '6', 'free'),
  ('951f8d70-374d-575b-a025-317e5db9f953', '1', 'free'),
  ('951f8d70-374d-575b-a025-317e5db9f953', '2', 'free'),
  ('951f8d70-374d-575b-a025-317e5db9f953', '3', 'free'),
  ('951f8d70-374d-575b-a025-317e5db9f953', '4', 'free'),
  ('951f8d70-374d-575b-a025-317e5db9f953', '5', 'free'),
  ('951f8d70-374d-575b-a025-317e5db9f953', '6', 'free'),
  ('d900bc2a-800f-5f74-8a79-d6699abaf985', '1', 'free'),
  ('d900bc2a-800f-5f74-8a79-d6699abaf985', '2', 'free'),
  ('d900bc2a-800f-5f74-8a79-d6699abaf985', '3', 'free'),
  ('d900bc2a-800f-5f74-8a79-d6699abaf985', '4', 'free'),
  ('d900bc2a-800f-5f74-8a79-d6699abaf985', '5', 'free'),
  ('d900bc2a-800f-5f74-8a79-d6699abaf985', '6', 'free'),
  ('3a231ce1-2acd-5990-8ff5-e6c3279498b9', '1', 'free'),
  ('3a231ce1-2acd-5990-8ff5-e6c3279498b9', '2', 'free'),
  ('3a231ce1-2acd-5990-8ff5-e6c3279498b9', '3', 'free'),
  ('3a231ce1-2acd-5990-8ff5-e6c3279498b9', '4', 'free'),
  ('3a231ce1-2acd-5990-8ff5-e6c3279498b9', '5', 'free'),
  ('3a231ce1-2acd-5990-8ff5-e6c3279498b9', '6', 'free'),
  ('b280caa0-d656-55ca-aa4a-cf5a6614ac33', '1', 'free'),
  ('b280caa0-d656-55ca-aa4a-cf5a6614ac33', '2', 'free'),
  ('b280caa0-d656-55ca-aa4a-cf5a6614ac33', '3', 'free'),
  ('b280caa0-d656-55ca-aa4a-cf5a6614ac33', '4', 'free'),
  ('b280caa0-d656-55ca-aa4a-cf5a6614ac33', '5', 'free'),
  ('b280caa0-d656-55ca-aa4a-cf5a6614ac33', '6', 'free');

insert into delivery_zones (id, name, fee, definition, is_active) values
  ('7768d1b6-336a-5d20-b4ee-24c637321165', 'תל אביב והסביבה', '60', '{"cities": ["תל אביב-יפו", "רמת גן", "גבעתיים"]}', '1'),
  ('ac4d48bf-afc9-578e-af10-11dd0dd1c725', 'הרצליה', '90', '{"cities": ["הרצליה"]}', '1'),
  ('f5b0369f-687d-5735-8223-d9d14cea931f', 'פתח תקווה', '100', '{"cities": ["פתח תקווה"]}', '1'),
  ('147d84b5-c547-5149-a9c1-55f022ba880d', 'ראשון לציון', '110', '{"cities": ["ראשון לציון"]}', '1');

insert into time_slots (id, fulfillment_type, weekday, start_time, end_time, capacity, is_active) values
  ('7e40b53d-9f76-5e0c-9db1-2d6966aaf792', 'pickup', null, '10:00', '12:00', '5', '1'),
  ('aa78632b-4737-5166-939d-4798c4378cc2', 'pickup', null, '12:00', '14:00', '5', '1'),
  ('262035c4-43eb-5ba8-8958-1b87f75da127', 'pickup', null, '15:00', '17:00', '5', '1'),
  ('37a2fabf-b3d0-5fb5-9620-09b5ddf34ea0', 'delivery', null, '09:00', '11:00', '3', '1'),
  ('8ae77cea-243a-546c-a405-7b346d774e22', 'delivery', null, '11:00', '13:00', '3', '1'),
  ('4571bda2-2d1e-538b-8045-b3b504aeb272', 'delivery', null, '14:00', '16:00', '3', '1');

insert into blocked_dates (id, date, reason) values
  ('d9e9b99a-0e73-5b98-b040-42c2e3ee95c4', '2026-12-25', 'חופשת צוות');

insert into orders (id, customer_id, event_id, status, version, fulfillment_type, requested_at, delivery_address, delivery_zone_id, subtotal, delivery_fee, total, submitted_at, decided_at, decision_note, created_at, updated_at) values
  ('510c67c6-c2c9-5870-80ea-963249c3ae2b', '10b63184-26bb-5775-96f3-b1346ad8314a', '1b311e74-d0db-55cb-a3b4-4835c3a5813c', 'draft', '1', 'delivery', '2026-12-10T11:30:00', 'רחוב אחד העם 12, תל אביב', '7768d1b6-336a-5d20-b4ee-24c637321165', null, null, null, null, null, null, '2026-11-02 11:01:44', '2026-11-02 11:01:44'),
  ('426292a3-482c-55f9-97df-15a06c0834f2', '87c69ec4-7446-591a-8dbb-707e3c4013d7', '9558fef2-f31f-56ed-8276-87bfbec90f3c', 'pending_approval', '1', 'pickup', '2026-11-20T12:00:00', null, null, '690', '0', '690', '2026-11-01T18:00:00', null, null, '2026-11-02 11:01:44', '2026-11-02 11:01:44');

insert into order_items (id, order_id, dish_id, quantity, snapshot_name, snapshot_pricing_unit, snapshot_unit_price, snapshot_line_total) values
  ('2ca6f74d-7206-52fb-9041-385fe2cfdc8b', '510c67c6-c2c9-5870-80ea-963249c3ae2b', '28d3263b-cabe-54d2-8724-6d110b4f2da3', '4', null, null, null, null),
  ('123d248e-178f-5472-b87e-5282a869bb0a', '510c67c6-c2c9-5870-80ea-963249c3ae2b', '951f8d70-374d-575b-a025-317e5db9f953', '4', null, null, null, null),
  ('ab3ce180-fcbc-5375-a47d-05821f33ddd2', '510c67c6-c2c9-5870-80ea-963249c3ae2b', '3a231ce1-2acd-5990-8ff5-e6c3279498b9', '4', null, null, null, null),
  ('2be373cd-81f6-53e9-8602-490ef5c7e845', '426292a3-482c-55f9-97df-15a06c0834f2', '81b803ef-74ef-5512-949b-798d625e08c2', '3', 'סלט חצילים קלויים', 'per_tray', '90', '270'),
  ('f88dba31-c4ef-5011-bdcb-c4983f76496c', '426292a3-482c-55f9-97df-15a06c0834f2', 'b280caa0-d656-55ca-aa4a-cf5a6614ac33', '35', 'שתייה קלה ומים', 'per_guest', '12', '420');

insert into ai_conversations (id, order_id, created_at) values
  ('1668b312-14e6-58ec-ae77-627f28a85419', '510c67c6-c2c9-5870-80ea-963249c3ae2b', '2026-11-02 11:01:44');

insert into ai_messages (id, conversation_id, role, content, created_at) values
  ('51d08f18-b880-5eb1-b9a0-480d089cfd37', '1668b312-14e6-58ec-ae77-627f28a85419', 'user', '{"text": "יש לנו אורחים טבעונים, מה מתאים?"}', '2026-11-02 11:01:44'),
  ('59ea6385-9e1a-5c95-bb1a-f8a6178846d7', '1668b312-14e6-58ec-ae77-627f28a85419', 'assistant', '{"text": "תבשיל קדרה צמחי מסומן כטבעוני. להוסיף 3 מגשים?"}', '2026-11-02 11:01:44');

insert into ai_change_proposals (id, order_id, conversation_id, base_order_version, changes, price_before, price_after, status, created_at, decided_at, executed_at) values
  ('4bd0e554-0363-5a3f-9e26-5af37a3885fb', '510c67c6-c2c9-5870-80ea-963249c3ae2b', '1668b312-14e6-58ec-ae77-627f28a85419', '1', '[{"op": "add_item", "dish_id": "d8", "quantity": 3}]', '1196', '1706', 'pending', '2026-11-02 11:01:44', null, null);
update dish_categories set slug = v.slug
from (values ('סלטים ומטבלים', 'salads'), ('עיקריות', 'mains'), ('דגים', 'fish'),
             ('תוספות ולחמים', 'sides'), ('קינוחים', 'desserts'), ('שתייה', 'drinks')) as v(name, slug)
where dish_categories.name = v.name;
