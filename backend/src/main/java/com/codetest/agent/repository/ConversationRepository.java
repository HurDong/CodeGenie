package com.codetest.agent.repository;

import com.codetest.agent.domain.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {
    List<Conversation> findAllByOrderByUpdatedAtDesc();

    List<Conversation> findByUserIdOrderByUpdatedAtDesc(String userId);
}
