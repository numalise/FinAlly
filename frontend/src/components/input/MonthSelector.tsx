'use client';

import { HStack, Select, IconButton, Text, Box } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface MonthSelectorProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthSelector({ year, month, onChange }: MonthSelectorProps) {
  const handlePrevious = () => {
    if (month === 1) {
      onChange(year - 1, 12);
    } else {
      onChange(year, month - 1);
    }
  };

  const handleNext = () => {
    if (month === 12) {
      onChange(year + 1, 1);
    } else {
      onChange(year, month + 1);
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(parseInt(e.target.value), month);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(year, parseInt(e.target.value));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <HStack spacing={3} bg="background.secondary" px={4} py={2} borderRadius="lg">
      <IconButton
        aria-label="Previous month"
        icon={<FiChevronLeft />}
        onClick={handlePrevious}
        variant="ghost"
        size="sm"
        color="text.primary"
        _hover={{ bg: 'background.tertiary' }}
      />
      
      <HStack spacing={2}>
        <Select
          value={month}
          onChange={handleMonthChange}
          size="md"
          w="140px"
          variant="filled"
          bg="background.tertiary"
          border="none"
          color="text.primary"
          _hover={{ bg: 'background.tertiary' }}
          _focus={{ bg: 'background.tertiary', borderColor: 'brand.500' }}
          sx={{
            option: {
              bg: 'background.secondary',
              color: 'text.primary',
              _hover: {
                bg: 'background.tertiary',
              }
            }
          }}
        >
          {MONTHS.map((monthName, index) => (
            <option key={index + 1} value={index + 1}>
              {monthName}
            </option>
          ))}
        </Select>
        
        <Select
          value={year}
          onChange={handleYearChange}
          size="md"
          w="100px"
          variant="filled"
          bg="background.tertiary"
          border="none"
          color="text.primary"
          _hover={{ bg: 'background.tertiary' }}
          _focus={{ bg: 'background.tertiary', borderColor: 'brand.500' }}
          sx={{
            option: {
              bg: 'background.secondary',
              color: 'text.primary',
              _hover: {
                bg: 'background.tertiary',
              }
            }
          }}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </HStack>

      <IconButton
        aria-label="Next month"
        icon={<FiChevronRight />}
        onClick={handleNext}
        variant="ghost"
        size="sm"
        color="text.primary"
        _hover={{ bg: 'background.tertiary' }}
      />
    </HStack>
  );
}
