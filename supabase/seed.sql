insert into public.daily_prompts (prompt_set_version, night, prompt)
values
  ('review-v1', 1, 'what stayed with you after the day ended?'),
  ('review-v1', 2, 'what felt difficult to explain today?'),
  ('review-v1', 3, 'where did you feel most like yourself today?'),
  ('review-v1', 4, 'what did you notice but not mention?'),
  ('review-v1', 5, 'what are you carrying more gently tonight?'),
  ('review-v1', 6, 'what changed your mind, even slightly?'),
  ('review-v1', 7, 'what do you want to remember from this week?'),
  ('review-v1', 8, 'what did you protect today?'),
  ('review-v1', 9, 'what did you not say out loud today?'),
  ('review-v1', 10, 'what felt closer than it did yesterday?'),
  ('review-v1', 11, 'what are you learning to leave unfinished?'),
  ('review-v1', 12, 'what made the day feel real?'),
  ('review-v1', 13, 'what did you need but not ask for?'),
  ('review-v1', 14, 'what surprised you about your own response?'),
  ('review-v1', 15, 'what are you returning to?'),
  ('review-v1', 16, 'what became easier to name?'),
  ('review-v1', 17, 'what do you understand differently now?'),
  ('review-v1', 18, 'what would you like to meet with more patience?'),
  ('review-v1', 19, 'what part of this journey feels most yours?'),
  ('review-v1', 20, 'what are you ready to carry forward?'),
  ('review-v1', 21, 'what would you want another person to know about this time?')
on conflict (prompt_set_version, night) do nothing;
