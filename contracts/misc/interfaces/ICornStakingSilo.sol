// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

interface ICornStakingSilo {
    function sharesOf(address user, address token) external view returns (uint256);
}