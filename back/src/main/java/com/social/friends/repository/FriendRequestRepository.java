package com.social.friends.repository;

import com.social.friends.entity.FriendRequest;
import com.social.login.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Integer> {
    boolean existsBySenderUserIdAndReceiverUserId(Integer senderId, Integer receiverId);

    // ✅ 친구 요청 목록 조회 (receiverId 기준)
    @Query("SELECT fr FROM FriendRequest fr WHERE fr.receiver.userId = :receiverId")
    List<FriendRequest> findByReceiverId(@Param("receiverId") Integer receiverId);

    // ✅ 특정 친구 요청이 존재하는지 확인
    boolean existsBySenderAndReceiver(User sender, User receiver);

    // ✅ 친구 요청 삭제
    @Transactional
    void deleteBySenderAndReceiver(User sender, User receiver);

    // ✅ 내가 보낸 친구 요청 확인 (PENDING 상태 확인용)
    @Query("SELECT COUNT(fr) > 0 FROM FriendRequest fr WHERE fr.sender.userId = :userId AND fr.receiver.userId = :targetId")
    boolean existsSentRequest(@Param("userId") Integer userId, @Param("targetId") Integer targetId);

    // ✅ 내가 받은 친구 요청 확인 (RECEIVED 상태 확인용)
    @Query("SELECT COUNT(fr) > 0 FROM FriendRequest fr WHERE fr.receiver.userId = :userId AND fr.sender.userId = :targetId")
    boolean existsReceivedRequest(@Param("userId") Integer userId, @Param("targetId") Integer targetId);
}
