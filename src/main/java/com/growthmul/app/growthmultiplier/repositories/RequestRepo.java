package com.growthmul.app.growthmultiplier.repositories;

import com.growthmul.app.growthmultiplier.entity.Requests;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequestRepo extends JpaRepository<Requests, Integer> {
}
