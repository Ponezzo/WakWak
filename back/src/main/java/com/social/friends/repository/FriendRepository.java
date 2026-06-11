package com.social.friends.repository;

import com.social.friends.dto.FriendProjection;
import com.social.friends.entity.Friend;
import com.social.friends.entity.FriendId;
import com.social.login.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface FriendRepository extends JpaRepository<Friend, FriendId> {
    boolean existsByUser1UserIdAndUser2UserId(Integer user1, Integer user2);

    @Query("SELECT COUNT(f) > 0 FROM Friend f WHERE (f.user1 = :user1 AND f.user2 = :user2) OR (f.user1 = :user2 AND f.user2 = :user1)")
    boolean existsByUsers(@Param("user1") User user1, @Param("user2") User user2);

    @Query(value = """
        SELECT u.user_id AS userId, u.nickname AS nickname, u.media_url AS mediaUrl  -- ✅ profile_image → media_url 변경
        FROM users u
        JOIN (
            SELECT user1_id AS friend_id FROM friends WHERE user2_id = :userId
            UNION ALL
            SELECT user2_id AS friend_id FROM friends WHERE user1_id = :userId
        ) f ON u.user_id = f.friend_id
    """, nativeQuery = true)
    List<FriendProjection> findFriendsByUserId(@Param("userId") Integer userId);

    @Transactional
    @Modifying
    @Query("DELETE FROM Friend f WHERE (f.user1.userId = :userId AND f.user2.userId = :friendId) " +
            "OR (f.user1.userId = :friendId AND f.user2.userId = :userId)")
    int deleteFriendship(Integer userId, Integer friendId);


    @Query("SELECT COUNT(f) > 0 FROM Friend f " +
            "WHERE (f.user1.userId = :userId AND f.user2.userId = :targetId) " +
            "OR (f.user1.userId = :targetId AND f.user2.userId = :userId)")
    boolean existsByFriendship(@Param("userId") Integer userId, @Param("targetId") Integer targetId);

    // ✅ 1단계 친구 조회
    @Query("SELECT CASE " +
            "WHEN f.user1.userId = :userId THEN f.user2.userId " +
            "WHEN f.user2.userId = :userId THEN f.user1.userId " +
            "END " +
            "FROM Friend f WHERE f.user1.userId = :userId OR f.user2.userId = :userId")
    List<Integer> findFirstDegreeFriends(@Param("userId") Integer userId);

    // ✅ 2단계 친구 조회 (1단계 친구를 통해 연결된 친구)
    @Query("SELECT DISTINCT CASE " +
            "WHEN f.user1.userId = :friendId THEN f.user2.userId " +
            "WHEN f.user2.userId = :friendId THEN f.user1.userId " +
            "END " +
            "FROM Friend f WHERE (f.user1.userId = :friendId OR f.user2.userId = :friendId) " +
            "AND (f.user1.userId <> :userId AND f.user2.userId <> :userId)")
    List<Integer> findSecondDegreeFriends(@Param("friendId") Integer friendId, @Param("userId") Integer userId);


}
