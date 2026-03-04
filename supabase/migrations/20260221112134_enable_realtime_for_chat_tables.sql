/*
  # Enable Realtime for Chat Tables

  ## Purpose
  Adds order_messages and order_chats tables to the Supabase realtime publication
  so that new messages and chat state changes are broadcast in real-time to all
  connected clients.

  ## Changes
  - Adds `order_messages` to supabase_realtime publication
  - Adds `order_chats` to supabase_realtime publication

  ## Notes
  Without these entries, postgres_changes subscriptions silently receive no events,
  causing messages to only appear after a manual reload.
*/

ALTER PUBLICATION supabase_realtime ADD TABLE order_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE order_chats;
