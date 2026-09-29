package org.jobportal.profileservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class AddressDto {
    private String houseNo;
    private String street;
    private String city;
    private String state;
    private int pincode;
}