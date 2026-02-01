
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.gemini_ai_chat.databinding.ListItemChatMessageBinding;

import java.util.List;

public class ChatAdapter extends RecyclerView.Adapter<ChatAdapter.MessageViewHolder> {

    private List<Message> messages;

    public ChatAdapter(List<Message> messages) {
        this.messages = messages;
    }

    @NonNull
    @Override
    public MessageViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ListItemChatMessageBinding binding = ListItemChatMessageBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new MessageViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull MessageViewHolder holder, int position) {
        Message message = messages.get(position);
        holder.bind(message);
    }

    @Override
    public int getItemCount() {
        return messages.size();
    }

    public void setMessages(List<Message> messages) {
        this.messages = messages;
        notifyDataSetChanged();
    }

    static class MessageViewHolder extends RecyclerView.ViewHolder {
        private final ListItemChatMessageBinding binding;

        public MessageViewHolder(ListItemChatMessageBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }

        public void bind(Message message) {
            binding.messageText.setText(message.text);
            LinearLayout.LayoutParams params = (LinearLayout.LayoutParams) binding.messageText.getLayoutParams();
            if (message.isUser) {
                params.gravity = Gravity.END;
                binding.messageText.setBackgroundResource(R.drawable.user_message_background);
            } else {
                params.gravity = Gravity.START;
                binding.messageText.setBackgroundResource(R.drawable.ai_message_background);
            }
            binding.messageText.setLayoutParams(params);
        }
    }
}
